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
        <p className="text-muted-foreground mt-4">请求的页面不存在</p>
        <Button className="mt-6" variant="outline" onClick={back}>
          <ChevronLeftIcon />
          返回
        </Button>
      </div>
    </AppFrame>
  )
}
