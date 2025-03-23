import './globals.css'

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { cn } from '@/lib/utils'
import { QueryProvider } from '@/components/query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalEnv } from '@/app/global-env'
import { GlobalStoreProvider } from '@/stores'
import { loadGlobalData } from '@/stores/server-store'

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
          <GlobalEnv>
            <QueryProvider>
              <NuqsAdapter>
                <GlobalStoreProvider initState={globalData}>
                  <TooltipProvider>{children}</TooltipProvider>
                </GlobalStoreProvider>
              </NuqsAdapter>
            </QueryProvider>
          </GlobalEnv>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
