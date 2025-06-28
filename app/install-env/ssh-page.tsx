'use client'

import dynamic from 'next/dynamic'

import { useGlobalStore } from '@/stores'

const XtermSsh = dynamic(() => import('@/components/base/xterm-ssh').then((mod) => mod.XtermSsh), { ssr: false })

export function SshPage() {
  const hosts = useGlobalStore((s) => s.finalSshHosts)

  return (
    <div className="h-160 w-full p-4">
      <XtermSsh host={hosts[0].ip} />
    </div>
  )
}
