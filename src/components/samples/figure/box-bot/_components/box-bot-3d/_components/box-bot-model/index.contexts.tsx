'use client'

import * as React from 'react'
import type { PropsWithChildren } from 'react'

import { createRequiredContext } from '@/utils/create-required-context'

const { RequiredContext, useRequiredContext } =
  createRequiredContext<EventTarget>(
    'useBoxBotEventTarget should be used within <BoxBotEventProvider>',
  )

/** box-bot-model の action イベント用 EventTarget を配布する Context */
export const BoxBotEventContext = RequiredContext

/** box-bot-model の action イベント発行/購読に使う EventTarget を取得する */
export const useBoxBotEventTarget = (): EventTarget => useRequiredContext()

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
