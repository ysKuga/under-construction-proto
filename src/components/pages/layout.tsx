import { PropsWithChildren } from 'react'

import { AppProvider } from '@/app/provider'

export const metadata = {
  description: 'Under Construction Proto',
  manifest: '/manifest.json',
  title: 'Under Construction Proto',
}

/**
 * PagesLayout — アプリ共通のページ枠
 *
 * - `AppProvider`(react-query / ErrorBoundary / 通知)と `<main>` を提供する
 * - `<html>`/`<body>` は持たない(`layouts/_base` が担当)。Storybook からは `layout.decorator` 経由でこの枠だけを適用する
 */
const PagesLayout = ({ children }: PropsWithChildren) => {
  return (
    <AppProvider>
      <main>{children}</main>
    </AppProvider>
  )
}

export default PagesLayout
