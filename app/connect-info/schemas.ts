import { makeErrorMap } from '@/lib/zod-utils'
import { z } from '@/lib/zod-zh'

export const enabledDefaultCredentialsSchema = z
  .object({
    enabled: z.literal(true),
    username: z.string({ message: '默认凭据用户名不能为空' }).nonempty('默认凭据用户名不能为空'),
  })
  .and(
    z.discriminatedUnion(
      'type',
      [
        z.object({
          type: z.literal('password'),
          password: z.string({ message: '默认凭据密码不能为空' }).nonempty('默认凭据密码不能为空'),
        }),
        z.object({
          type: z.literal('key'),
          privateKey: z.string({ message: '默认凭据密钥不能为空' }).nonempty('默认凭据密钥不能为空'),
        }),
        z.object({
          type: z.literal('no-password'),
        }),
      ],
      { message: '请选择凭据类型' },
    ),
  )

export const defaultCredentialsSchema = z.union([
  enabledDefaultCredentialsSchema,
  z.object({ enabled: z.literal(false) }),
])

export type FinalDefaultCredentials = z.infer<typeof defaultCredentialsSchema>

export const bmcConnectionInfoSchema = z.object({
  ip: z.string({ message: 'IP 地址不能为空' }).nonempty('IP 地址不能为空').ip(),
  username: z.string().optional(),
  password: z.string().optional(),
})

export const bmcFinalConnectionInfoSchema = z.object({
  ip: z.string({ message: 'IP 地址不能为空' }).nonempty('IP 地址不能为空').ip(),
  username: z.string({ message: '用户名不能为空' }).nonempty('用户名不能为空'),
  password: z.string({ message: '密码不能为空' }).nonempty('密码不能为空'),
})

export type BmcFinalConnectionInfo = z.infer<typeof bmcFinalConnectionInfoSchema>

export const bmcHostsListSchema = z.array(bmcFinalConnectionInfoSchema)

export const sshConnectionInfoSchema = z.object({
  ip: z.string({ message: 'IP 地址不能为空' }).nonempty('IP 地址不能为空').ip(),
  username: z.string().optional(),
  credentialType: z.enum(['password', 'key', 'no-password']).optional(),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  port: z.number().min(0, '端口号范围必须为 0-65535').max(65535, '端口号范围必须为 0-65535').default(22),
  bmcIp: z.string().ip().optional(),
})

export const sshFinalConnectionInfoSchema = z
  .object({
    ip: z.string({ message: 'IP 地址不能为空' }).nonempty('IP 地址不能为空').ip(),
    port: z.number().min(0, '端口号范围必须为 0-65535').max(65535, '端口号范围必须为 0-65535').default(22),
    bmcIp: z.string().ip().optional(),
  })
  .extend({ username: z.string({ message: '用户名不能为空' }).nonempty('用户名不能为空') })
  .and(
    z.discriminatedUnion(
      'credentialType',
      [
        z.object({
          credentialType: z.literal('password'),
          password: z.string({ message: '密码不能为空' }).nonempty('密码不能为空'),
        }),
        z.object({
          credentialType: z.literal('key'),
          privateKey: z.string({ message: '密钥不能为空' }).nonempty('密钥不能为空'),
        }),
        z.object({
          credentialType: z.literal('no-password'),
        }),
      ],
      {
        errorMap: makeErrorMap({
          invalid_union_discriminator: '请选择凭据类型',
        }),
      },
    ),
  )

export type SshFinalConnectionInfo = z.infer<typeof sshFinalConnectionInfoSchema>

export const sshHostsListSchema = z.array(sshFinalConnectionInfoSchema)
