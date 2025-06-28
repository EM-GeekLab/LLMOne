import './globals.css'

import * as process from 'node:process'

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { ReactScan } from '@/lib/react-scan'
import { cn } from '@/lib/utils'
import { EnvProvider } from '@/components/env-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalStoreProvider } from '@/stores'
import { LocalStoreProvider } from '@/stores/local-store-provider'
import { TrpcReactProvider } from '@/trpc/client'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

const jetBrainsMono = localFont({
  src: './fonts/JetBrainsMonoVF.woff2',
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'LLMOne',
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
  return (
    <html suppressHydrationWarning lang="zh">
      {process.env.NODE_ENV === 'development' && <ReactScan />}
      <body className={cn(geistSans.variable, geistMono.variable, jetBrainsMono.variable, 'font-sans antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TrpcReactProvider>
            <NuqsAdapter>
              <EnvProvider>
                <LocalStoreProvider>
                  <GlobalStoreProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                  </GlobalStoreProvider>
                </LocalStoreProvider>
              </EnvProvider>
            </NuqsAdapter>
            <Toaster />
          </TrpcReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
