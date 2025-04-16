import * as React from 'react'
import { ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ModelIcon } from '@lobehub/icons'
import { useForm } from 'react-hook-form'

import { DescriptionsList } from '@/components/base/descriptions-list'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CredentialType } from '@/stores'
import { useModelStore } from '@/stores/model-store-provider'
import { AppRouter } from '@/trpc/router'

import { HostSelectContent } from '../host-select-content'
import { useModelDeployContext } from '../model-deploy-provider'
import { modelDeployConfigSchema, ModelDeployConfigType } from './schemas'

type ModelInfo = Awaited<ReturnType<AppRouter['resource']['getModels']>>[number]

export function DeployButton({ model }: { model: ModelInfo }) {
  const [open, setOpen] = useState(false)
  const { push } = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">部署模型</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>模型配置</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">配置模型部署的参数和选项</DialogDescription>
        <ModelInfo model={model} />
        <DeployForm
          modelPath={model.modelInfoPath}
          onSubmitted={() => {
            setOpen(false)
            push('/deploy-model')
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function ModelInfo({ model }: { model: ModelInfo }) {
  const entries: { id: string; key: ReactNode; value: ReactNode }[] = [
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
      id: 'requireGpu',
      key: '硬件需求',
      value: model.requirements.gpu,
    },
    {
      id: 'requireRam',
      key: '内存需求',
      value: `${model.requirements.ram} GB`,
    },
    {
      id: 'storageSize',
      key: '存储大小',
      value: `${model.storageSize} GB`,
    },
  ]

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <ModelIcon type="color" model={model.logoKey} size={32} />
        <div className="min-w-0 text-sm font-medium">{model.displayName}</div>
      </div>
      <DescriptionsList className="px-4 py-3" entries={entries} />
    </div>
  )
}

function DeployForm({ modelPath, onSubmitted }: { modelPath: string; onSubmitted?: () => void }) {
  const addDeployment = useModelStore((s) => s.addModelDeployment)
  const { deployMutation } = useModelDeployContext()

  const form = useForm<ModelDeployConfigType>({
    resolver: zodResolver(modelDeployConfigSchema),
    defaultValues: { modelPath },
  })

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          addDeployment(values)
          deployMutation.mutate()
          onSubmitted?.()
        })}
      >
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="host"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>部署主机</FormLabel>
                <Select value={value} onValueChange={(v: CredentialType) => onChange(v)} {...rest}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择主机" />
                    </SelectTrigger>
                  </FormControl>
                  <HostSelectContent />
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field: { value = '', onChange, ...rest } }) => (
              <FormItem className="basis-[92px]">
                <FormLabel>服务端口</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    min={0}
                    max={65535}
                    onChange={(e) => onChange(Number(e.target.value))}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit">开始部署</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
