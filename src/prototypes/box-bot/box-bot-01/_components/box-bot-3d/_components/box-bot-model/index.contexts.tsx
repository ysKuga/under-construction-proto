'use client'

import * as React from 'react'
import type { PropsWithChildren } from 'react'
import type { Group } from 'three'

import { createRequiredContext } from '@/utils/create-required-context'

import type { BoxBotRefs } from './index.types'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useBoxBotEventTarget should be used within <BoxBotEventProvider>',
  )

/** box-bot-model の action イベント用 EventTarget を配布する Context */
export const BoxBotEventContext = RequiredContext

/** box-bot-model の action イベント発行/購読に使う EventTarget を取得する */
export const useBoxBotEventTarget = (): EventTarget => useRequiredContext()

const {
  RequiredContext: RequiredRefsContext,
  useRequiredContext: useRequiredRefsContext,
} = createRequiredContext<BoxBotRefs>(
  'useBoxBotRefs should be used within <BoxBotRefsProvider>',
)

/** bot 本体で共有する ref 群を配布する Context */
export const BoxBotRefsContext = RequiredRefsContext

/** bot 本体で共有する ref 群を取得する */
export const useBoxBotRefs = (): BoxBotRefs => useRequiredRefsContext()

/**
 * bot 本体で共有する ref 群を生成し配布する
 *
 * - 現状は `rootRef`(jump の squash 対象)のみ。アクション固有の ref は\
 *   各アクション(`_actions/<name>/`)が自前で `useRef` する
 * - 複数アクションから同じ ref を参照する形は Context で配布する(r3f-state ルール)
 */
export const BoxBotRefsProvider = ({ children }: PropsWithChildren) => {
  const rootRef = React.useRef<Group>(null)

  const refs = React.useMemo<BoxBotRefs>(() => ({ rootRef }), [rootRef])

  return (
    <BoxBotRefsContext.Provider value={refs}>
      {children}
    </BoxBotRefsContext.Provider>
  )
}

type BoxBotEventProviderProps = PropsWithChildren<{
  /** 外部から共有する EventTarget。省略時は instance 固有のものを内部生成 */
  eventTarget?: EventTarget
}>

/**
 * instance 固有(または外部共有)の EventTarget を配布する
 *
 * - lazy initializer で 1 度だけ生成する。ref の `.current` をレンダー中に読んで\
 *   Context 値へ渡す形は React Compiler の `react-hooks/refs` ルールに抵触するため、\
 *   `useState` の setter を使わない形(実質 const)で代替する
 */
export const BoxBotEventProvider = ({
  children,
  eventTarget: eventTargetProp,
}: BoxBotEventProviderProps) => {
  const [eventTarget] = React.useState<EventTarget>(
    () => eventTargetProp ?? new EventTarget(),
  )

  return (
    <BoxBotEventContext.Provider value={eventTarget}>
      {children}
    </BoxBotEventContext.Provider>
  )
}
