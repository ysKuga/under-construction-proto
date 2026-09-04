import { ReactNode } from 'react'

import BaseLayout from '@/components/layouts/_base'
import PagesLayout from '@/components/pages/layout'
import '@/styles/globals.css'

export { metadata } from '@/components/pages/layout'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <BaseLayout>
      <PagesLayout>{children}</PagesLayout>
    </BaseLayout>
  )
}

export default RootLayout
