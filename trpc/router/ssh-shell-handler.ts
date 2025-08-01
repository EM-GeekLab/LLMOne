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

import { TRPCError } from '@trpc/server'
import { match } from 'ts-pattern'
import type WebSocket from 'ws'

import { PtySize } from '@/components/base/xterm/utils'
import { sshDm } from '@/trpc/router/ssh-deploy'

export type SshHandlerOptions = {
  size?: PtySize
}

export async function sshShellHandler(host: string, ws: WebSocket, options: SshHandlerOptions = {}) {
  if (!sshDm) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '需要先初始化 SSH 部署器',
    })
  }
  const deployer = sshDm.list.find((d) => d.host === host)
  if (!deployer) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `未找到主机 ${host} 的部署配置`,
    })
  }

  const stream = await deployer.ctl.ssh.requestShell({ ...options.size, term: 'xterm-256color' })

  ws.on('message', (message: Buffer) => {
    const [chan, data] = JSON.parse(message.toString())
    match(chan)
      .with('d', () => stream.write(data))
      .with('r', () => stream.setWindow(data.rows, data.cols, data.height, data.width))
  })

  ws.on('close', () => {
    stream.end()
  })

  stream.on('data', (data: Buffer) => {
    ws.send(data)
  })

  stream.on('close', () => {
    ws.close()
  })
}
