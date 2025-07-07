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

'use client'

import * as React from 'react'
import { ReactNode } from 'react'
import { ModelIcon, OpenWebUI } from '@lobehub/icons'
import { useQuery } from '@tanstack/react-query'
import { group } from 'radash'

import { AppCardSection, AppCardSectionTitle } from '@/components/app/app-card'
import { DescriptionsList } from '@/components/base/descriptions-list'
import { CopyButton } from '@/app/(model)/(report)/copy-button'
import { ModelDeployConfigType } from '@/app/(model)/select-model/schemas'
import { NexusGateConfigType, OpenWebuiConfigType } from '@/app/(model)/service-config/schemas'
import NexusGateLogo from '@/public/icons/nexus-gate.svg'
import { useModelStore } from '@/stores/model-store-provider'
import { useTRPC } from '@/trpc/client'

export function ServiceInfo() {
  return (
    <>
      <AppCardSection>
        <AppCardSectionTitle>模型信息</AppCardSectionTitle>
        <ModelsInfo />
      </AppCardSection>
      <AppCardSection>
        <AppCardSectionTitle>服务信息</AppCardSectionTitle>
        <NexusGateServicesInfo />
        <OpenWebuiServicesInfo />
      </AppCardSection>
    </>
  )
}

function ModelsInfo() {
  const deployment = useModelStore((s) => s.modelDeploy.config)
  const deploymentValues = Array.from(deployment.values())
  const modelPaths = deploymentValues.map((d) => d.modelPath)
  const groupedDeployment = group(deploymentValues, (d) => d.modelPath)

  return (
    <div className="grid gap-4">
      {modelPaths.map((path) => (
        <ModelInfo key={path} modelPath={path} deployments={groupedDeployment[path]} />
      ))}
    </div>
  )
}

function ModelInfo({ modelPath, deployments = [] }: { modelPath: string; deployments?: ModelDeployConfigType[] }) {
  const trpc = useTRPC()
  const { data: model } = useQuery(trpc.resource.getModelInfo.queryOptions(modelPath))

  if (!model) return null

  const entries: { id: string; key: ReactNode; value: ReactNode }[] = [
    {
      id: 'name',
      key: '名称',
      value: model.displayName,
    },
    {
      id: 'parameters',
      key: '参数量',
      value: `${model.parameters} B`,
    },
    {
      id: 'weightType',
      key: '精度',
      value: <div className="font-mono">{model.weightType}</div>,
    },
    {
      id: 'storageSize',
      key: '存储大小',
      value: `${model.storageSize} GB`,
    },
  ]

  return (
    <div className="grid gap-2 rounded-lg border p-2 xl:grid-cols-2">
      <div className="grid grid-cols-[1fr_auto]">
        <DescriptionsList className="px-2 py-1" entries={entries} />
        <div className="p-2 pl-0">
          <ModelIcon type="color" model={model.logoKey} size={32} />
        </div>
      </div>
      {deployments.length > 0 && (
        <div className="grid gap-2">
          {deployments.map((deploy) => (
            <ModelHostDeployment key={deploy.host} deployment={deploy} />
          ))}
        </div>
      )}
    </div>
  )
}

function ModelHostDeployment({ deployment }: { deployment: ModelDeployConfigType }) {
  const trpc = useTRPC()
  const { data: host } = useQuery(trpc.connection.getHostInfo.queryOptions(deployment.host))

  if (!host) return null

  const ipAddr = host.ip[0]
  const url = ipAddr ? `http://${ipAddr}:${deployment.port}` : undefined

  return (
    <div className="rounded-md bg-muted/50 px-3.5 py-2.5">
      <div className="mb-1 text-sm font-medium">{host.info.system_info.hostname || ipAddr}</div>
      <DescriptionsList
        omitNull
        entries={[
          {
            id: 'API 端点',
            value: url ? (
              <CopyButton value={url} message="已复制 API 端点">
                {url}
              </CopyButton>
            ) : null,
          },
        ]}
      />
    </div>
  )
}

function OpenWebuiServicesInfo() {
  const deployment = useModelStore((s) => s.serviceDeploy.config.openWebui)
  const openWebuiInfo = Array.from(deployment.values())

  if (deployment.size === 0) return null

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border px-4 py-3">
      <div className="row-span-2 pt-1">
        <OpenWebUI size={20} />
      </div>
      <h2 className="text-base font-semibold">Open WebUI</h2>
      {openWebuiInfo.map((info) => (
        <OpenWebuiInfo key={info.host} info={info} />
      ))}
    </div>
  )
}

function OpenWebuiInfo({ info }: { info: OpenWebuiConfigType }) {
  const trpc = useTRPC()
  const { data: host } = useQuery(trpc.connection.getHostInfo.queryOptions(info.host))

  if (!host) return null

  const ipAddr = host?.ip[0]
  const url = ipAddr ? `http://${ipAddr}:${info.port}` : undefined

  return (
    <div className="col-start-2">
      <div className="mb-1 text-sm font-medium">{host.info.system_info.hostname || ipAddr}</div>
      <DescriptionsList
        entries={[
          {
            id: 'url',
            key: '访问地址',
            value: (
              <a href={url} target="_blank" className="font-medium text-primary hover:underline">
                {url}
              </a>
            ),
          },
        ]}
      />
    </div>
  )
}

function NexusGateServicesInfo() {
  const deployment = useModelStore((s) => s.serviceDeploy.config.nexusGate)
  const info = Array.from(deployment.values())

  if (deployment.size === 0) return null

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border px-4 py-3">
      <div className="row-span-2 pt-1">
        <NexusGateLogo className="-mx-0.5 size-6" />
      </div>
      <h2 className="text-base font-semibold">Open WebUI</h2>
      {info.map((info) => (
        <NexusGateInfo key={info.host} info={info} />
      ))}
    </div>
  )
}

function NexusGateInfo({ info }: { info: NexusGateConfigType }) {
  const trpc = useTRPC()
  const { data: host } = useQuery(trpc.connection.getHostInfo.queryOptions(info.host))

  if (!host) return null

  const ipAddr = host?.ip[0]
  const url = ipAddr ? `http://${ipAddr}:${info.port}` : undefined

  return (
    <div className="col-start-2">
      <div className="mb-1 text-sm font-medium">{host.info.system_info.hostname || ipAddr}</div>
      <DescriptionsList
        entries={[
          {
            id: 'url',
            key: '访问地址',
            value: (
              <a href={url} target="_blank" className="font-medium text-primary hover:underline">
                {url}
              </a>
            ),
          },
          {
            id: '管理员密钥',
            value: (
              <CopyButton value={info.adminKey} message="已复制管理员密钥">
                {info.adminKey}
              </CopyButton>
            ),
          },
        ]}
      />
    </div>
  )
}
