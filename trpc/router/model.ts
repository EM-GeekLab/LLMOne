import { basename, dirname } from 'path'

import { TRPCError } from '@trpc/server'
import type { Aria2RpcHTTPUrl } from 'maria2'

import { downloadFile, downloadWithMetalink } from '@/lib/aria2'
import { mxc } from '@/lib/metalx'
import { createActor, createActorManager } from '@/lib/progress/utils'
import { z } from '@/lib/zod'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'
import { openWebuiConfigSchema } from '@/app/(model)/service-config/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { applyLocalDockerImage } from './docker-utils'
import { addDirMap, addFileMap, executeCommand, getHostArch, getHostInfo, getHostIp, makeEnvs } from './mxc-utils'
import { getContainers, readModelInfo, readModelInfoAbsolute } from './resource-utils'

const MODEL_WORK_DIR = '/srv/models'
const DOCKER_IMAGES_DIR = '/srv/images'

export const modelRouter = createRouter({
  deployModel: baseProcedure
    .input(modelDeployConfigSchema.extend({ manifestPath: z.string(), from: z.number().default(0) }))
    .mutation(async function* ({ input: { host, modelPath, port, apiKey, manifestPath, from } }) {
      const config = await readModelInfoAbsolute(modelPath)

      const containers = await getContainers(manifestPath)
      const hostInfo = await getHostInfo(host)
      const hostArch = await getHostArch(hostInfo)
      const matchedContainer = containers.find((c) => c.repo === config.docker.image && c.arch === hostArch)
      if (!matchedContainer) {
        throw new TRPCError({
          message: `没有找到 ${config.docker.image} 的镜像`,
          code: 'BAD_REQUEST',
        })
      }

      const metalinkUrl = await addDirMap(host, dirname(config.metaLinkFile))
      const hostAddr = await getHostIp(hostInfo)
      const aria2RpcUrl: Aria2RpcHTTPUrl = `http://${hostAddr}:6800/jsonrpc`

      const actorDocker = createActor({
        name: '传输 Docker 镜像',
        type: 'fake',
        ratio: 30,
        runningMessage: '正在传输 Docker 镜像',
        formatProgress: (progress) => `正在传输 Docker 镜像 ${progress.toFixed(1)}%`,
        formatResult: () => 'Docker 镜像传输完成',
        formatError: (error) => `Docker 镜像传输失败: ${error.message}`,
        execute: async ({ onProgress }) => {
          const containerUrl = await addFileMap(host, matchedContainer.file)
          const fileSha1 = await mxc.getFileHash(matchedContainer.file, 'sha1')
          await executeCommand(host, `mkdir -p ${DOCKER_IMAGES_DIR}`)
          await downloadFile(containerUrl, aria2RpcUrl, DOCKER_IMAGES_DIR, fileSha1, {
            onProgress: async ({ overallProgress }) => onProgress(overallProgress),
          })
          await applyLocalDockerImage(host, `${DOCKER_IMAGES_DIR}/${basename(matchedContainer.file)}`)
        },
      })

      const actorModel = createActor({
        name: '传输模型文件',
        type: 'real',
        ratio: 60,
        runningMessage: '正在传输模型文件',
        formatProgress: (progress) => `正在传输模型文件 ${progress.toFixed(1)}%`,
        formatResult: () => '模型文件传输完成',
        formatError: (error) => `模型文件传输失败: ${error.message}`,
        execute: async ({ onProgress }) => {
          const modelTargetPath = `${MODEL_WORK_DIR}/${config.modelId}`
          await executeCommand(host, `mkdir -p ${modelTargetPath}`, 100)
          await downloadWithMetalink(`${metalinkUrl}/${basename(config.metaLinkFile)}`, aria2RpcUrl, modelTargetPath, {
            onProgress: async ({ overallProgress }) => onProgress(overallProgress),
          })
        },
      })

      const actorRun = createActor({
        name: '启动模型服务',
        type: 'fake',
        ratio: 10,
        runningMessage: '正在部署模型服务',
        formatResult: () => '模型服务已启动',
        formatError: (error) => `模型服务启动失败: ${error.message}`,
        execute: async () => {
          const envCommands = makeEnvs({
            IMAGE_ID: config.docker.image,
            WORK_DIR: MODEL_WORK_DIR,
            MODEL_PATH: config.modelId,
            SERVED_MODEL_NAME: config.modelId,
            GPU_COUNT: 1,
            VLLM_PORT: port,
            MODEL_API_KEY: apiKey,
          })
          const command = [...envCommands, config.docker.command].join('\n')
          await executeCommand(host, command)
        },
      })

      yield* createActorManager([actorDocker, actorModel, actorRun], {
        formatInit: () => '等待部署',
      }).runFromIndex(from)
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
      .mutation(async function* ({ input: { host, manifestPath, modelConfig, name, port, from } }) {
        const containers = await getContainers(manifestPath)
        const hostInfo = await getHostInfo(host)
        const hostArch = await getHostArch(hostInfo)
        const openWebuiContainer = containers.find((c) => c.repo === 'open-webui' && c.arch === hostArch)
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

        const matchedAddr = await getHostIp(hostInfo)
        const modelInfo = await readModelInfo(modelConfig.modelPath)
        const aria2RpcUrl: Aria2RpcHTTPUrl = `http://${matchedAddr}:6800/jsonrpc`

        const actorDocker = createActor({
          name: '传输 Docker 镜像',
          type: 'fake',
          ratio: 30,
          runningMessage: '正在传输 Docker 镜像',
          formatProgress: (progress) => `正在传输 Docker 镜像 ${progress.toFixed(1)}%`,
          formatResult: () => 'Docker 镜像传输完成',
          formatError: (error) => `Docker 镜像传输失败: ${error.message}`,
          execute: async ({ onProgress }) => {
            const containerUrl = await addFileMap(host, openWebuiContainer.file)
            const fileSha1 = await mxc.getFileHash(openWebuiContainer.file, 'sha1')
            await executeCommand(host, `mkdir -p /srv/images`)
            await downloadFile(containerUrl, aria2RpcUrl, DOCKER_IMAGES_DIR, fileSha1, {
              onProgress: async ({ overallProgress }) => onProgress(overallProgress),
            })
            await applyLocalDockerImage(host, `/srv/images/${basename(openWebuiContainer.file)}`)
          },
        })

        const actorRun = createActor({
          name: '启动 Open WebUI 服务',
          type: 'fake',
          ratio: 70,
          runningMessage: '正在部署 Open WebUI 服务',
          formatResult: () => 'Open WebUI 服务已启动',
          formatError: (error) => `Open WebUI 服务启动失败: ${error.message}`,
          execute: async () => {
            const envCommands = makeEnvs({
              MODEL_NAMES: modelInfo.modelId,
              MODEL_HOST_IP: matchedAddr,
              MODEL_PORT: modelConfig.port,
              MODEL_API_KEY: modelConfig.apiKey,
              HOST_IP: matchedAddr,
              TARGET_PORT: port,
              WEBUI_NAME: name,
            })

            const command = [...envCommands, openWebuiContainer.command].join('\n')
            await executeCommand(host, command)
          },
        })

        yield* createActorManager([actorDocker, actorRun], {
          formatInit: () => '等待部署',
        }).runFromIndex(from)
      }),
  },
})
