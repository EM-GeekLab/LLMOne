import { basename } from 'node:path'
import { join } from 'node:path/posix'

import { TRPCError } from '@trpc/server'
import type { Aria2RpcHTTPUrl } from 'maria2'

import { downloadFile } from '@/lib/aria2'
import { mxc } from '@/lib/metalx'
import { z } from '@/lib/zod'
import { BenchmarkPercentile, BenchmarkResult, BenchmarkSummary } from '@/app/(model)/(report)/performance-test/types'
import { baseProcedure, createRouter } from '@/trpc/init'
import { benchmarkModeEnum, RunBenchmarkInput, runBenchmarkSchema } from '@/trpc/inputs/benchmark'
import { applyLocalDockerImage, imageExists } from '@/trpc/router/docker-utils'

import { DOCKER_IMAGES_DIR } from './constants'
import { addFileMap, executeCommand, getHostArch, getHostIp, withEnv } from './mxc-utils'
import { getContainers, readModelInfo } from './resource-utils'

class BenchmarkResultCache {
  cache = new Map<string, Map<RunBenchmarkInput['mode'], { startup: Date; promise: Promise<BenchmarkResult> }>>()

  add(host: string, mode: RunBenchmarkInput['mode'], promise: Promise<BenchmarkResult>) {
    if (!this.cache.has(host)) {
      this.cache.set(host, new Map())
    }
    this.cache.get(host)!.set(mode, { startup: new Date(), promise })
  }

  remove(host: string, mode: RunBenchmarkInput['mode']) {
    this.cache.get(host)?.delete(mode)
  }

  get(host: string, mode: RunBenchmarkInput['mode']): Promise<BenchmarkResult> | undefined {
    return this.cache.get(host)?.get(mode)?.promise
  }

  getStartup(host: string, mode: RunBenchmarkInput['mode']): Date | undefined {
    return this.cache.get(host)?.get(mode)?.startup
  }

  has(host: string, mode: RunBenchmarkInput['mode']): boolean {
    return this.cache.get(host)?.has(mode) ?? false
  }
}

const resultCache = new BenchmarkResultCache()

export const benchmarkRouter = createRouter({
  runQuickTest: baseProcedure.input(runBenchmarkSchema).query(async function ({ input }): Promise<BenchmarkResult> {
    const { deployment, mode } = input

    if (resultCache.has(deployment.host, mode)) {
      return await resultCache.get(deployment.host, mode)!
    }

    const promise = runBenchmark(input)
    resultCache.add(deployment.host, mode, promise)
    return await promise.catch((err) => {
      resultCache.remove(deployment.host, mode)
      throw err
    })
  }),
  runTest: baseProcedure.input(runBenchmarkSchema).mutation(async function ({ input }): Promise<BenchmarkResult> {
    const { deployment, mode } = input
    const promise = runBenchmark(input)
    resultCache.add(deployment.host, mode, promise)
    return await promise.catch((err) => {
      resultCache.remove(deployment.host, mode)
      throw err
    })
  }),
  getTestStartup: baseProcedure
    .input(z.object({ host: z.string(), mode: benchmarkModeEnum }))
    .query(async ({ input: { host, mode } }) => resultCache.getStartup(host, mode) ?? null),
  getResult: baseProcedure
    .input(z.object({ host: z.string(), mode: benchmarkModeEnum }))
    .query(async ({ input: { host, mode } }) => resultCache.get(host, mode) ?? null),
})

async function runBenchmark({ deployment, mode, manifestPath }: RunBenchmarkInput): Promise<BenchmarkResult> {
  const hostAddr = await getHostIp(deployment.host)
  const model = await readModelInfo(deployment.modelPath)

  const benchmarkImage = 'llm-pref-test'
  const containers = await getContainers(manifestPath)
  const hostArch = await getHostArch(deployment.host)
  const matchedContainer = containers.find((c) => c.repo === benchmarkImage && c.arch === hostArch)
  if (!matchedContainer) {
    throw new TRPCError({
      message: `资源包中没有找到性能测试镜像`,
      code: 'BAD_REQUEST',
    })
  }

  const benchmarkCommand = withEnv(
    `
nohup docker run -e MODEL_HOST_IP=\${MODEL_HOST_IP} -e MODEL_PORT=\${MODEL_PORT} -e MODEL_NAME=\${MODEL_NAME} -e MODEL_API_KEY=\${MODEL_API_KEY} -e TEST_MODE=\${TEST_MODE} -v ./out:/app/out llm-pref-test > test.log 2>&1 &
docker_pid=$!
wait $docker_pid

jq -c '.' ./out/\${TEST_MODE}/benchmark_summary.json
jq -c '.' ./out/\${TEST_MODE}/benchmark_percentile.json`,
    {
      MODEL_HOST_IP: hostAddr,
      MODEL_PORT: deployment.port,
      MODEL_NAME: model.modelId,
      MODEL_API_KEY: deployment.apiKey,
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
