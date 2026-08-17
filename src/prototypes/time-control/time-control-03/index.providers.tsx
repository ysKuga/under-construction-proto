import { PropsWithChildren } from 'react'

import { ComputedProvider } from './_computed'
import { ScopeEventProvider } from './_events'
import { StoresProvider } from './_stores/index.contexts'
import { TimeControl03PropsProvider } from './index.contexts'
import { TimeControl03Props } from './index.types'

type TimeControl03ProvidersProps = PropsWithChildren<TimeControl03Props>

/**
 * props・store・computed・event 等、アプリ全体で共有する Provider をまとめてネストする
 *
 * - `ComputedProvider`・`ScopeEventProvider` は `StoresProvider` の内側に置く\
 *   (どちらも store の Context を参照するため)
 */
export const TimeControl03Providers = (props: TimeControl03ProvidersProps) => (
  <TimeControl03PropsProvider {...props}>
    <StoresProvider>
      <ComputedProvider>
        <ScopeEventProvider>{props.children}</ScopeEventProvider>
      </ComputedProvider>
    </StoresProvider>
  </TimeControl03PropsProvider>
)
