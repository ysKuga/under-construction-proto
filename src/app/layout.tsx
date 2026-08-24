import { ReactNode } from 'react'

import { AppProvider } from '@/app/provider'
import '@/styles/globals.css'

export const metadata = {
  description: 'Under Construction Proto',
  title: 'Under Construction Proto',
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}

export default RootLayout
