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

import { readableSize } from './utils'

export interface SelectOptions {
  accept?: string
  multiple?: boolean
  directory?: boolean
}

export function selectFile({ accept, multiple, directory }: SelectOptions = {}): Promise<FileList | null> {
  const input = document.createElement('input')
  input.type = 'file'
  input.style.display = 'none'

  if (accept) input.accept = accept
  if (multiple) input.multiple = true
  if (directory) input.webkitdirectory = true

  return new Promise((resolve, reject) => {
    input.onchange = () => resolve(input.files)
    input.onerror = (_e, _s, _l, _c, error) =>
      reject(new Error('无法选择文件：' + error?.message || '未知错误', { cause: error }))
    input.click()
  })
}

export interface SelectAndReadOptions extends Omit<SelectOptions, 'multiple' | 'directory'> {
  // Maximum file size in bytes, default is 1MB (1024 * 1024)
  maxSize?: number
}

export async function selectFileAndRead(options: SelectAndReadOptions = {}): Promise<string | undefined> {
  const { maxSize = 1024 * 1024, ...rest } = options

  const files = await selectFile({ ...rest, multiple: false }).catch((err) => {
    throw new Error(err.message, { cause: err })
  })

  const file = files?.[0]
  if (!file) return

  if (file.size > maxSize) {
    throw new Error(`文件大小超出限制 ${readableSize(maxSize)}（选择文件为 ${readableSize(file.size)}）`)
  }

  return await file.text()
}
