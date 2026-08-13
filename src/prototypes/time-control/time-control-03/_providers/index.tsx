import { ReactNode } from 'react'

import { ScopeEventProvider } from '../_events'
import { StoresProvider } from '../_stores/index.contexts'

type TimeControl03ProvidersProps = {
  /** Provider 配下の子要素 */
  children: ReactNode
}

/**
 * store・event 等、アプリ全体で共有する Provider をまとめてネストする
 *
 * - `ScopeEventProvider` は `StoresProvider` の内側に置く (`ScopeEventListeners` が\
 *   store の Context を参照するため)
 */
export const TimeControl03Providers = (props: TimeControl03ProvidersProps) => {
  const { children } = props

  return (
    <StoresProvider>
      <ScopeEventProvider>{children}</ScopeEventProvider>
    </StoresProvider>
  )
}
