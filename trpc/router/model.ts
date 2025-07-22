/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { basename, dirname } from 'node:path'
import { join } from 'node:path/posix'

import { TRPCError } from '@trpc/server'
import type { Aria2RpcHTTPUrl } from 'maria2'
import { retry } from 'radash'
import yaml from 'yaml'

import { downloadFile, downloadWithMetalink } from '@/lib/aria2'
import { mxc } from '@/lib/metalx'
import { flowActors } from '@/lib/progress/utils/server'
import { sendModelDeployEvent, sendServiceDeployEvent } from '@/lib/telemetry'
import { z } from '@/lib/zod'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'
import { nexusGateConfigSchema, openWebuiConfigSchema } from '@/app/(model)/service-config/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'
import { gatewayConfigStore } from '@/trpc/router/gateway-config-store'

import { DOCKER_COMPOSE_DIR, DOCKER_IMAGES_DIR, MODEL_WORK_DIR } from './constants'
import { applyLocalDockerImage, imageExists } from './docker-utils'
import { addDirMap, addFileMap, executeCommand, getHostArch, getHostIp, makeEnvs } from './mxc-utils'
import { getContainers, readModelInfo, readModelInfoAbsolute } from './resource-utils'

export const modelRouter = createRouter({
  deployModel: baseProcedure
    .input(modelDeployConfigSchema.extend({ manifestPath: z.string(), from: z.number().default(0) }))
    .mutation(async function* ({ input: { host, modelPath, port, manifestPath, from } }) {
      const config = await readModelInfoAbsolute(modelPath)

      const containers = await getContainers(manifestPath)
      const hostArch = await getHostArch(host)
      const matchedContainer = containers.find((c) => c.repo === config.docker.image && c.arch === hostArch)
      if (!matchedContainer) {
        throw new TRPCError({
          message: `没有找到 ${config.docker.image} 的镜像`,
          code: 'BAD_REQUEST',
        })
      }

      const metalinkUrl = await addDirMap(host, dirname(config.metaLinkFile))
      const hostAddr = await getHostIp(host)
      const aria2RpcUrl: Aria2RpcHTTPUrl = `http://${hostAddr}:6800/jsonrpc`

      const modelTargetPath = join(MODEL_WORK_DIR, config.modelId)

      const envCommands = makeEnvs(
        {
          IMAGE_ID: config.docker.image,
          WORK_DIR: MODEL_WORK_DIR,
          MODEL_BASE_DIR: MODEL_WORK_DIR,
          MODEL_PATH: config.modelId,
          SERVED_MODEL_NAME: config.modelId,
          GPU_COUNT: 1,
          VLLM_PORT: port,
          MODEL_PORT: port,
          CONFIG_JSON: join(modelTargetPath, 'mindie_config.json'),
        },
        config.docker.command,
      )

      yield* flowActors({ formatInit: () => '等待部署' })
        .actor({
          name: '传输 Docker 镜像',
          type: 'real',
          ratio: 30,
          runningMessage: '正在传输 Docker 镜像',
          formatProgress: (progress) => `正在传输 Docker 镜像 ${progress.toFixed(1)}%`,
          formatResult: () => 'Docker 镜像传输完成',
          formatError: (error) => `Docker 镜像传输失败: ${error.message}`,
          execute: async ({ onProgress }) => {
            if (await imageExists(host, config.docker.image)) return
            const containerUrl = await addFileMap(host, matchedContainer.file)
            const fileSha1 = await mxc.getFileHash(basename(matchedContainer.file), 'sha1')
            await executeCommand(host, `mkdir -p ${DOCKER_IMAGES_DIR}`, 100)
            await downloadFile(containerUrl, aria2RpcUrl, DOCKER_IMAGES_DIR, fileSha1, {
              onProgress: async ({ overallProgress }) => onProgress(overallProgress),
            })
          },
        })
        .actor({
          name: '载入 Docker 镜像',
          type: 'fake',
          ratio: 15,
          runningMessage: '正在读取载入 Docker 镜像',
          formatResult: () => 'Docker 镜像载入完成',
          formatError: (error) => `Docker 镜像载入失败: ${error.message}`,
          execute: async () => {
            if (await imageExists(host, config.docker.image)) return
            await applyLocalDockerImage(host, join(DOCKER_IMAGES_DIR, basename(matchedContainer.file)))
          },
        })
        .actor({
          name: '传输模型文件',
          type: 'real',
          ratio: 50,
          runningMessage: '正在传输模型文件',
          formatProgress: (progress) => `正在传输模型文件 ${progress.toFixed(1)}%`,
          formatResult: () => '模型文件传输完成',
          formatError: (error) => `模型文件传输失败: ${error.message}`,
          execute: async ({ onProgress }) => {
            await executeCommand(host, `mkdir -p ${modelTargetPath}`, 100)
            await downloadWithMetalink(
              `${metalinkUrl}/${basename(config.metaLinkFile)}`,
              aria2RpcUrl,
              modelTargetPath,
              { onProgress: async ({ overallProgress }) => onProgress(overallProgress) },
            )
          },
        })
        .actor({
          name: '启动模型服务',
          type: 'fake',
          ratio: 5,
          runningMessage: '正在部署模型服务',
          formatResult: () => '模型服务已启动',
          formatError: (error) => `模型服务启动失败: ${error.message}`,
          execute: async () => {
            const command = [...envCommands, config.docker.command].join('\n')
            await executeCommand(host, command)
          },
        })
        .run(from)

      sendModelDeployEvent(config.modelId)
    }),
  deployService: {
    openWebui: baseProcedure
      .input(
        openWebuiConfigSchema.extend({
          modelConfig: modelDeployConfigSchema,
          manifestPath: z.string(),
          from: z.number().default(0),
        }),
      )
      .mutation(async function* ({ input: { host, manifestPath, name, port, from } }) {
        const containers = await getContainers(manifestPath)
        const hostArch = await getHostArch(host)
        const openWebuiContainer = containers.find(
          (c) => c.repo === 'ghcr.io/open-webui/open-webui' && c.arch === hostArch,
        )
        if (!openWebuiContainer) {
          throw new TRPCError({
            message: '没有找到 open-webui 的镜像',
            code: 'BAD_REQUEST',
          })
        }
        if (!openWebuiContainer.command) {
          throw new TRPCError({
            message: 'open-webui 镜像配置中没有运行命令',
            code: 'BAD_REQUEST',
          })
        }

        const matchedAddr = await getHostIp(host)
        const aria2RpcUrl: Aria2RpcHTTPUrl = `http://${matchedAddr}:6800/jsonrpc`
        const gatewayConfig = await gatewayConfigStore.get(host)

        const envCommands = makeEnvs(
          {
            MODEL_NAMES: gatewayConfig.modelId,
            MODEL_HOST_IP: gatewayConfig.address,
            MODEL_PORT: gatewayConfig.port,
            MODEL_API_KEY: gatewayConfig.apiKey,
            HOST_IP: gatewayConfig.address,
            TARGET_PORT: port,
            WEBUI_NAME: name,
          },
          openWebuiContainer.command,
        )

        yield* flowActors({ formatInit: () => '等待部署' })
          .actor({
            name: '传输 Docker 镜像',
            type: 'real',
            ratio: 75,
            runningMessage: '正在传输 Docker 镜像',
            formatProgress: (progress) => `正在传输 Docker 镜像 ${progress.toFixed(1)}%`,
            formatResult: () => 'Docker 镜像传输完成',
            formatError: (error) => `Docker 镜像传输失败: ${error.message}`,
            execute: async ({ onProgress }) => {
              if (await imageExists(host, openWebuiContainer.repo)) return
              const containerUrl = await addFileMap(host, openWebuiContainer.file)
              const fileSha1 = await mxc.getFileHash(basename(openWebuiContainer.file), 'sha1')
              await executeCommand(host, `mkdir -p ${DOCKER_IMAGES_DIR}`, 100)
              await downloadFile(containerUrl, aria2RpcUrl, DOCKER_IMAGES_DIR, fileSha1, {
                onProgress: async ({ overallProgress }) => onProgress(overallProgress),
              })
            },
          })
          .actor({
            name: '载入 Docker 镜像',
            type: 'fake',
            ratio: 15,
            runningMessage: '正在读取载入 Docker 镜像',
            formatResult: () => 'Docker 镜像载入完成',
            formatError: (error) => `Docker 镜像载入失败: ${error.message}`,
            execute: async () => {
              if (await imageExists(host, openWebuiContainer.repo)) return
              await applyLocalDockerImage(host, join(DOCKER_IMAGES_DIR, basename(openWebuiContainer.file)))
            },
          })
          .actor({
            name: '启动 Open WebUI 服务',
            type: 'fake',
            ratio: 10,
            runningMessage: '正在部署 Open WebUI 服务',
            formatResult: () => 'Open WebUI 服务已启动',
            formatError: (error) => `Open WebUI 服务启动失败: ${error.message}`,
            execute: async () => {
              const command = [...envCommands, openWebuiContainer.command].join('\n')
              await executeCommand(host, command)
            },
          })
          .run(from)

        sendServiceDeployEvent('Open WebUI')
      }),
    nexusGate: baseProcedure
      .input(
        nexusGateConfigSchema.extend({
          modelConfig: modelDeployConfigSchema,
          manifestPath: z.string(),
          from: z.number().default(0),
        }),
      )
      .mutation(async function* ({ input: { host, manifestPath, modelConfig, adminKey, port, from } }) {
        const containers = await getContainers(manifestPath)
        const hostArch = await getHostArch(host)
        const matchedContainers = containers.filter(
          (c) =>
            ['ghcr.io/em-geeklab/nexus-gate-server', 'ghcr.io/em-geeklab/nexus-gate-web', 'redis', 'postgres'].includes(
              c.repo,
            ) && c.arch === hostArch,
        )
        if (matchedContainers.length < 4) {
          throw new TRPCError({
            message: '没有找到 NexusGate 所需的全部镜像',
            code: 'BAD_REQUEST',
          })
        }

        const matchedAddr = await getHostIp(host)
        const modelInfo = await readModelInfo(modelConfig.modelPath)
        const aria2RpcUrl: Aria2RpcHTTPUrl = `http://${matchedAddr}:6800/jsonrpc`

        yield* flowActors({ formatInit: () => '等待部署' })
          .actor({
            name: '传输 Docker 镜像',
            type: 'real',
            ratio: 75,
            runningMessage: '正在传输 Docker 镜像',
            formatResult: () => 'Docker 镜像传输完成',
            formatError: (error) => `Docker 镜像传输失败: ${error.message}`,
            execute: async ({ onProgress }) => {
              for (const [index, container] of matchedContainers.entries()) {
                if (await imageExists(host, container.repo)) continue
                const containerUrl = await addFileMap(host, container.file)
                const fileSha1 = await mxc.getFileHash(basename(container.file), 'sha1')
                await executeCommand(host, `mkdir -p ${DOCKER_IMAGES_DIR}`, 100)
                await downloadFile(containerUrl, aria2RpcUrl, DOCKER_IMAGES_DIR, fileSha1, {
                  onProgress: async ({ overallProgress }) =>
                    onProgress(
                      (overallProgress + index * 100) / matchedContainers.length,
                      `正在传输 Docker 镜像 ${overallProgress.toFixed(1)}% (${index + 1}/${matchedContainers.length})`,
                    ),
                })
              }
            },
          })
          .actor({
            name: '载入 Docker 镜像',
            type: 'fake',
            ratio: 15,
            runningMessage: '正在读取载入 Docker 镜像',
            formatResult: () => 'Docker 镜像载入完成',
            formatError: (error) => `Docker 镜像载入失败: ${error.message}`,
            execute: async () => {
              await Promise.all(
                containers.map(async (container) => {
                  if (await imageExists(host, container.repo)) return
                  await applyLocalDockerImage(host, join(DOCKER_IMAGES_DIR, basename(container.file)))
                }),
              )
            },
          })
          .actor({
            name: '启动 NexusGate 服务',
            type: 'fake',
            ratio: 10,
            runningMessage: '正在部署 NexusGate 服务',
            formatResult: () => 'NexusGate 服务已启动',
            formatError: (error) => `NexusGate 服务启动失败: ${error.message}`,
            execute: async () => {
              const serviceDir = join(DOCKER_COMPOSE_DIR, 'nexusgate')
              // 生成初始配置文件
              const initConfigContent = {
                upstreams: [
                  {
                    name: 'LLMOne',
                    url: `http://${matchedAddr}:${modelConfig.port}/v1`,
                    model: modelInfo.modelId,
                    upstreamModel: modelInfo.modelId,
                    weight: 1,
                  },
                ],
              }

              // 生成 docker-compose.yaml 文件
              /* eslint-disable camelcase */
              const dockerComposeContent = {
                services: {
                  database: {
                    image: 'postgres:latest',
                    environment: ['POSTGRES_USER=nexusgate', `POSTGRES_PASSWORD=${adminKey}`],
                    volumes: ['./db:/var/lib/postgresql/data'],
                    restart: 'on-failure',
                    healthcheck: {
                      test: ['CMD-SHELL', 'pg_isready -U nexusgate -h localhost'],
                      interval: '5s',
                      timeout: '5s',
                      retries: 5,
                    },
                  },
                  redis: {
                    image: 'redis:latest',
                    restart: 'on-failure',
                  },
                  backend: {
                    image: 'ghcr.io/em-geeklab/nexus-gate-server:latest',
                    environment: [
                      `DATABASE_URL=postgres://nexusgate:${adminKey}@database:5432/nexusgate`,
                      `ADMIN_SUPER_SECRET=${adminKey}`,
                      'REDIS_URL=redis://redis:6379',
                      'ENABLE_INIT_CONFIG=true',
                      'INIT_CONFIG_PATH=/app/init-config.json',
                    ],
                    restart: 'on-failure',
                    depends_on: {
                      database: {
                        condition: 'service_healthy',
                      },
                      redis: {
                        condition: 'service_started',
                      },
                    },
                    volumes: [`${serviceDir}/init-config.json:/app/init-config.json`],
                  },
                  frontend: {
                    image: 'ghcr.io/em-geeklab/nexus-gate-web:latest',
                    environment: ['BACKEND_URL=http://backend:3000'],
                    restart: 'on-failure',
                    depends_on: ['backend'],
                    ports: [`${port}:80`],
                  },
                },
              }
              /* eslint-enable camelcase */
              await executeCommand(
                host,
                [
                  `mkdir -p ${serviceDir}`,
                  `cd ${serviceDir}`,
                  `echo '${JSON.stringify(initConfigContent)}' > init-config.json`,
                  `echo '${yaml.stringify(dockerComposeContent)}' > docker-compose.yaml`,
                  `docker compose up -d`,
                ].join('\n'),
                100,
              )

              try {
                const getInitKey = async () => {
                  const apiKey = await fetch(`http://${matchedAddr}:${port}/api/admin/apiKey`, {
                    method: 'POST',
                    body: JSON.stringify({ comment: 'LLMOne 自动创建' }),
                    headers: { Authorization: `Bearer ${adminKey}`, 'Content-Type': 'application/json' },
                  })
                    .then((res): Promise<{ key: string }> => res.json())
                    .then(({ key }) => key)
                  gatewayConfigStore.set(host, { apiKey, address: matchedAddr, port, modelId: modelInfo.modelId })
                }
                await retry({ backoff: (i) => 10 ** i, times: 4 }, getInitKey)
              } catch (error) {
                throw new Error(`获取 NexusGate API 密钥失败: ${error}`)
              }
            },
          })
          .run(from)

        sendServiceDeployEvent('NexusGate')
      }),
  },
})
