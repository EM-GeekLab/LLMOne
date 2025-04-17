import { TRPCError } from '@trpc/server'

import { z } from '@/lib/zod'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'
import { openWebuiConfigSchema } from '@/app/(model)/service-config/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'
import { findMatchedIp } from '@/trpc/router/connect-utils'

import { applyDockerImage } from './docker-utils'
import { addDirMap, addFileMap, executeCommand, getHostInfo, makeEnvs } from './mxc-utils'
import { getContainers, readModelInfo, readModelInfoAbsolute } from './resource-utils'

const MODEL_WORK_DIR = '/srv/models'

export const modelRouter = createRouter({
  deployModel: baseProcedure
    .input(modelDeployConfigSchema.extend({ manifestPath: z.string() }))
    .mutation(async ({ input: { host, modelPath, port, apiKey, manifestPath } }) => {
      const config = await readModelInfoAbsolute(modelPath)

      const containers = await getContainers(manifestPath)
      const matchedContainer = containers.find((c) => c.repo === config.docker.image)
      if (!matchedContainer) {
        throw new TRPCError({
          message: `没有找到 ${config.docker.image} 的镜像`,
          code: 'BAD_REQUEST',
        })
      }

      const modelUrl = await addDirMap(host, config.modelDir)

      const containerUrl = await addFileMap(host, matchedContainer.file)
      await applyDockerImage(host, containerUrl)

      const initCommands = [`mkdir -p ${MODEL_WORK_DIR}`]
      const envCommands = makeEnvs({
        IMAGE_ID: config.docker.image,
        WORK_DIR: MODEL_WORK_DIR,
        MODEL_PATH: config.modelDir,
        SERVED_MODEL_NAME: config.modelId,
        GPU_COUNT: 1,
        VLLM_PORT: port,
        MODEL_API_KEY: apiKey,
      })
      const postCommands = [`curl -Ls ${JSON.stringify(modelUrl)} | tar x -C "$WORK_DIR"`]
      const command = [...initCommands, ...envCommands, ...postCommands, config.docker.command].join('\n')
      return await executeCommand(host, command)
    }),
  deployService: {
    openWebui: baseProcedure
      .input(openWebuiConfigSchema.extend({ modelConfig: modelDeployConfigSchema, manifestPath: z.string() }))
      .mutation(async function ({ input: { host, manifestPath, modelConfig, name, port } }) {
        const containers = await getContainers(manifestPath)
        const openWebuiContainer = containers.find((c) => c.repo === 'open-webui' && c.arch === 'x86_64')
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

        const hostInfo = await getHostInfo(host)
        const matchIps = findMatchedIp(hostInfo)
        const matchedAddr = matchIps[0]?.addr
        if (!matchedAddr) {
          throw new TRPCError({
            message: '无法获取主机的 IP 地址',
            code: 'BAD_REQUEST',
          })
        }

        const modelInfo = await readModelInfo(modelConfig.modelPath)

        const containerUrl = await addFileMap(host, openWebuiContainer.file)
        await applyDockerImage(host, containerUrl)

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
        return await executeCommand(host, command)
      }),
  },
})
