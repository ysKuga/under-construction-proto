import { ReactNode } from 'react'

import { DashboardLayout } from './_components/dashboard-layout'

export const metadata = {
  description: 'Dashboard',
  title: 'Dashboard',
}

const AppLayout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>
}

export default AppLayout
