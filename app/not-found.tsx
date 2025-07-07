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

import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'

import { AppFrame } from '@/components/app/app-frame'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { back } = useRouter()

  return (
    <AppFrame title="页面未找到">
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-xl font-bold">404 Not Found</h1>
        <p className="mt-4 text-muted-foreground">请求的页面不存在</p>
        <Button className="mt-6" variant="outline" onClick={back}>
          <ChevronLeftIcon />
          返回
        </Button>
      </div>
    </AppFrame>
  )
}
