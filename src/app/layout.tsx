import { SerwistProvider } from '@serwist/turbopack/react'
import { ReactNode } from 'react'

import { AppProvider } from '@/app/provider'
import '@/styles/globals.css'

export const metadata = {
  description: 'Under Construction Proto',
  manifest: '/manifest.json',
  title: 'Under Construction Proto',
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">
          <AppProvider>
            <main>{children}</main>
          </AppProvider>
        </SerwistProvider>
      </body>
    </html>
  )
}

export default RootLayout
