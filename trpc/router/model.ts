import { TRPCError } from '@trpc/server'

import { sleep } from '@/lib/utils'
import { z } from '@/lib/zod'
import { modelDeployConfigSchema } from '@/app/(model)/select-model/schemas'
import { openWebuiConfigSchema } from '@/app/(model)/service-config/schemas'
import { baseProcedure, createRouter } from '@/trpc/init'

import { applyDockerImage } from './docker-utils'
import { addDirMap, addFileMap, executeCommand, makeEnvs } from './mxc-utils'
import { getContainers, readModelInfoAbsolute } from './resource-utils'

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

      const containerUrl = await addFileMap(host, matchedContainer.file)
      await applyDockerImage(host, containerUrl)

      const modelUrl = await addDirMap(host, config.modelDir)

      const initCommands = [`mkdir -p ${MODEL_WORK_DIR}`]
      const envCommands = makeEnvs({
        IMAGE_ID: config.docker.image,
        WORK_DIR: MODEL_WORK_DIR,
        MODEL_NAME: config.repo,
        SERVED_MODEL_NAME: config.modelId,
        GPU_COUNT: 1,
        MODEL_PORT: port,
        MODEL_API_KEY: apiKey,
      })
      const postCommands = [`curl -Ls ${JSON.stringify(modelUrl)} | tar x -C "$WORK_DIR"`]
      const command = [...initCommands, ...envCommands, ...postCommands, config.docker.command].join('\n')
      return await executeCommand(host, command)
    }),
  deployService: {
    openWebui: baseProcedure
      .input(openWebuiConfigSchema.extend({ modelConfig: modelDeployConfigSchema.optional() }))
      .mutation(async function ({ input }) {
        await sleep(5000)
        return input
      }),
  },
})
