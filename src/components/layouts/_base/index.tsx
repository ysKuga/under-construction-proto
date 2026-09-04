import { SerwistProvider } from '@serwist/turbopack/react'
import { PropsWithChildren } from 'react'

/**
 * BaseLayout — HTML ドキュメントの外殻
 *
 * - `<html>`/`<body>` と Service Worker 登録(`SerwistProvider`)を担う
 * - App Router の RootLayout でのみ使う。Storybook は独自の `<html>`/`<body>` を持つため対象外
 */
const BaseLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="en">
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  )
}

export default BaseLayout
