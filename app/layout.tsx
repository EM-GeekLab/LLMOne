import './globals.css'

import { homedir } from 'node:os'

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { cn } from '@/lib/utils'
import { EnvProvider } from '@/components/env-provider'
import { QueryProvider } from '@/components/query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalStoreProvider } from '@/app/global-store/global-store-provider'
import { loadGlobalData } from '@/app/global-store/server-store'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'ModelMachine',
  description: '大模型一体机装机工具',
}

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  width: 'device-width',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const globalData = loadGlobalData()
  return (
    <html suppressHydrationWarning lang="zh">
      <body className={cn(geistSans.variable, geistMono.variable, 'font-sans antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <EnvProvider cwd={process.cwd()} home={homedir()}>
            <QueryProvider>
              <NuqsAdapter>
                <GlobalStoreProvider initState={globalData}>
                  <TooltipProvider>{children}</TooltipProvider>
                </GlobalStoreProvider>
              </NuqsAdapter>
            </QueryProvider>
          </EnvProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
