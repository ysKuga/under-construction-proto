import { PropsWithChildren } from 'react'

import { ScopeEventProvider } from './_events'
import { StoresProvider } from './_stores/index.contexts'
import { TimeControl03PropsProvider } from './index.contexts'
import { TimeControl03Props } from './index.types'

type TimeControl03ProvidersProps = PropsWithChildren<TimeControl03Props>

/**
 * props・store・event 等、アプリ全体で共有する Provider をまとめてネストする
 *
 * - `ScopeEventProvider` は `StoresProvider` の内側に置く (`ScopeEventListeners` が\
 *   store の Context を参照するため)
 */
export const TimeControl03Providers = (props: TimeControl03ProvidersProps) => (
  <TimeControl03PropsProvider {...props}>
    <StoresProvider>
      <ScopeEventProvider>{props.children}</ScopeEventProvider>
    </StoresProvider>
  </TimeControl03PropsProvider>
)
