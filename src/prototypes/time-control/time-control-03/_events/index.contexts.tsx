import { ReactNode, useState } from 'react'

import { ScopeEventContext } from './_contexts/scope-event-context'
import { ScopeEventListeners } from './_event-listeners'

export { useScopeEventTarget } from './_contexts/scope-event-context'

type ScopeEventProviderProps = {
  /** EventTarget を参照する子要素 */
  children: ReactNode
}

/**
 * scope (この time-control-03 instance) 専用の EventTarget を配布する
 *
 * - instance ごとに独立した EventTarget を生成するため、同名イベントを他部品・\
 *   同部品の別 instance で使い回しても衝突しない
 * - `StoresProvider` の内側に配置する前提 (`ScopeEventListeners` が store の\
 *   Context を参照するため)
 */
export const ScopeEventProvider = (props: ScopeEventProviderProps) => {
  const { children } = props

  const [eventTarget] = useState(() => new EventTarget())

  return (
    <ScopeEventContext.Provider value={eventTarget}>
      <ScopeEventListeners />
      {children}
    </ScopeEventContext.Provider>
  )
}
