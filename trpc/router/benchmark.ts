import { basename } from 'node:path'
import { join } from 'node:path/posix'

import { TRPCError } from '@trpc/server'
import type { Aria2RpcHTTPUrl } from 'maria2'

import { downloadFile } from '@/lib/aria2'
import { mxc } from '@/lib/metalx'
import { z } from '@/lib/zod'
import { BenchmarkPercentile, BenchmarkResult, BenchmarkSummary } from '@/app/(model)/(report)/performance-test/types'
import { baseProcedure, createRouter } from '@/trpc/init'
import {
  BenchmarkMode,
  benchmarkModeEnum,
  BenchmarkTestMeta,
  RunBenchmarkInput,
  runBenchmarkSchema,
} from '@/trpc/inputs/benchmark'
import { applyLocalDockerImage, imageExists } from '@/trpc/router/docker-utils'
import { gatewayConfigStore } from '@/trpc/router/gateway-config-store'

import { DOCKER_IMAGES_DIR } from './constants'
import { addFileMap, executeCommand, getHostArch, getHostIp, withEnv } from './mxc-utils'
import { getContainers } from './resource-utils'

class BenchmarkResultCache {
  cache = new Map<
    string,
    Map<
      BenchmarkMode,
      {
        startup: Date
        meta: BenchmarkTestMeta
        promise: Promise<BenchmarkResult>
      }
    >
  >()

  add(host: string, mode: BenchmarkMode, promise: Promise<BenchmarkResult>) {
    if (!this.cache.has(host)) {
      this.cache.set(host, new Map())
    }
    this.cache.get(host)!.set(mode, { startup: new Date(), meta: {}, promise })
  }

  updateMeta(host: string, mode: BenchmarkMode, update: (meta: BenchmarkTestMeta) => BenchmarkTestMeta) {
    const benchmark = this.cache.get(host)?.get(mode)
    if (benchmark) benchmark.meta = update(benchmark.meta)
  }

  remove(host: string, mode: BenchmarkMode) {
    this.cache.get(host)?.delete(mode)
  }

  get(host: string, mode: BenchmarkMode): Promise<BenchmarkResult> | undefined {
    return this.cache.get(host)?.get(mode)?.promise
  }

  getMeta(host: string, mode: BenchmarkMode): BenchmarkTestMeta | undefined {
    return this.cache.get(host)?.get(mode)?.meta
  }

  getStartup(host: string, mode: BenchmarkMode): Date | undefined {
    return this.cache.get(host)?.get(mode)?.startup
  }

  has(host: string, mode: BenchmarkMode): boolean {
    return this.cache.get(host)?.has(mode) ?? false
  }
}

const resultCache = new BenchmarkResultCache()

export const benchmarkRouter = createRouter({
  runQuickTest: baseProcedure
    .input(runBenchmarkSchema.extend({ refresh: z.boolean().default(false) }))
    .query(async function ({ input }): Promise<BenchmarkResult> {
      const { deployment, mode, refresh } = input

      if (!refresh && resultCache.has(deployment.host, mode)) {
        return await resultCache.get(deployment.host, mode)!
      }

      const promise = runBenchmark(input)
      resultCache.add(deployment.host, mode, promise)
      return await promise.catch((err) => {
        resultCache.remove(deployment.host, mode)
        throw err
      })
    }),
  runTest: baseProcedure.input(runBenchmarkSchema).mutation(async function ({ input }) {
    const { deployment, mode } = input
    const promise = runBenchmark(input)
    resultCache.add(deployment.host, mode, promise)
    promise.catch(() => resultCache.remove(deployment.host, mode))
  }),
  getTestStartup: baseProcedure
    .input(z.object({ host: z.string(), mode: benchmarkModeEnum }))
    .query(async ({ input: { host, mode } }) => resultCache.getStartup(host, mode) ?? null),
  getResult: baseProcedure
    .input(z.object({ host: z.string(), mode: benchmarkModeEnum }))
    .query(async ({ input: { host, mode } }) => resultCache.get(host, mode) ?? null),
  getMeta: baseProcedure
    .input(z.object({ host: z.string(), mode: benchmarkModeEnum }))
    .query(async ({ input: { host, mode } }) => resultCache.getMeta(host, mode) ?? null),
})

async function runBenchmark({ deployment, mode, manifestPath }: RunBenchmarkInput): Promise<BenchmarkResult> {
  const hostAddr = await getHostIp(deployment.host)

  const benchmarkImage = 'llm-perf-test'
  const resultDirectory = '/tmp/llm-perf-test'
  const containers = await getContainers(manifestPath)
  const hostArch = await getHostArch(deployment.host)
  const matchedContainer = containers.find((c) => c.repo === benchmarkImage && c.arch === hostArch)
  if (!matchedContainer) {
    throw new TRPCError({
      message: `资源包中没有找到性能测试镜像`,
      code: 'BAD_REQUEST',
    })
  }

  const gatewayConfig = await gatewayConfigStore.get(deployment.host)
  const benchmarkCommand = withEnv(
    `
mkdir -p \${RESULT_DIR}
cd \${RESULT_DIR}
  
docker run \
  --rm \
  --name \${REPO}-\${TEST_MODE} \
  -e MODEL_HOST_IP=\${MODEL_HOST_IP} \
  -e MODEL_PORT=\${MODEL_PORT} \
  -e MODEL_NAME=\${MODEL_NAME} \
  -e MODEL_API_KEY=\${MODEL_API_KEY} \
  -e TEST_MODE=\${TEST_MODE} \
  -v ./out:/app/out \
  \${REPO} > ./test.log 2>&1

jq -c '.' ./out/\${TEST_MODE}/benchmark_summary.json
jq -c '.' ./out/\${TEST_MODE}/benchmark_percentile.json`,
    {
      MODEL_HOST_IP: gatewayConfig.address,
      MODEL_PORT: gatewayConfig.port,
      MODEL_NAME: gatewayConfig.modelId,
      MODEL_API_KEY: gatewayConfig.apiKey,
      RESULT_DIR: resultDirectory,
      REPO: matchedContainer.repo,
      TEST_MODE: mode,
    },
  )

  // Check whether the docker image is existing
  if (!(await imageExists(deployment.host, benchmarkImage))) {
    const aria2RpcUrl: Aria2RpcHTTPUrl = `http://${hostAddr}:6800/jsonrpc`
    try {
      const containerUrl = await addFileMap(deployment.host, matchedContainer.file)
      const fileSha1 = await mxc.getFileHash(basename(matchedContainer.file), 'sha1')
      await executeCommand(deployment.host, `mkdir -p ${DOCKER_IMAGES_DIR}`, 100)
      await downloadFile(containerUrl, aria2RpcUrl, DOCKER_IMAGES_DIR, fileSha1)
    } catch (err) {
      throw new TRPCError({
        message: `镜像传输失败：${(err as Error).message}`,
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
    try {
      await applyLocalDockerImage(deployment.host, join(DOCKER_IMAGES_DIR, basename(matchedContainer.file)))
    } catch (err) {
      throw new TRPCError({
        message: `镜像读取载入失败：${(err as Error).message}`,
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  }

  resultCache.updateMeta(deployment.host, mode, (meta) => {
    meta.startedAt = new Date()
    return meta
  })

  // Run benchmark
  const { stdout } = await executeCommand(deployment.host, benchmarkCommand).catch((err) => {
    throw new TRPCError({
      message: `性能测试运行失败：${(err as Error).message}`,
      code: 'INTERNAL_SERVER_ERROR',
    })
  })
  const [summary, percentile] = stdout
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line)) as [BenchmarkSummary, BenchmarkPercentile[]]

  return { summary, percentile }
}
