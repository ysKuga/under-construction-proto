'use client'

import * as React from 'react'
import type { PropsWithChildren } from 'react'

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

/** box-bot-model の各 action hook が共有する ref 群を配布する Context */
export const BoxBotRefsContext = RequiredRefsContext

/** box-bot-model の各 action hook が共有する ref 群を取得する */
export const useBoxBotRefs = (): BoxBotRefs => useRequiredRefsContext()

/**
 * jump/spin/arm/leg/walking/marching の各 ref を生成し、action hook 群へ配布する
 *
 * - 生成した ref オブジェクト自体は各 hook 内で `.current` を書き換えるのみで\
 *   差し替えないため、`useMemo` で Context 値を安定させ、Provider の再レンダーが\
 *   下位 Consumer の不要な再レンダーを誘発しないようにする
 */
export const BoxBotRefsProvider = ({ children }: PropsWithChildren) => {
  const botHoverRef: BoxBotRefs['botHoverRef'] = React.useRef(false)
  const hoppingCooldownRef: BoxBotRefs['hoppingCooldownRef'] = React.useRef(-1)
  const hoppingRef: BoxBotRefs['hoppingRef'] = React.useRef(false)
  const jumpRef: BoxBotRefs['jumpRef'] = React.useRef(-1)
  const fallRef: BoxBotRefs['fallRef'] = React.useRef(-1)
  const fallPivotRef: BoxBotRefs['fallPivotRef'] = React.useRef(null)
  const getUpRef: BoxBotRefs['getUpRef'] = React.useRef(-1)
  const postureRef: BoxBotRefs['postureRef'] = React.useRef(0)
  const rootRef: BoxBotRefs['rootRef'] = React.useRef(null)
  const spinActionRef: BoxBotRefs['spinActionRef'] = React.useRef(-1)
  const spinRef: BoxBotRefs['spinRef'] = React.useRef(null)
  const leftArmRef: BoxBotRefs['leftArmRef'] = React.useRef(null)
  const rightArmRef: BoxBotRefs['rightArmRef'] = React.useRef(null)
  const leftLegRef: BoxBotRefs['leftLegRef'] = React.useRef(null)
  const rightLegRef: BoxBotRefs['rightLegRef'] = React.useRef(null)
  const walkingBobRef: BoxBotRefs['walkingBobRef'] = React.useRef(null)
  const walkingRef: BoxBotRefs['walkingRef'] = React.useRef(false)
  const marchingRef: BoxBotRefs['marchingRef'] = React.useRef(false)

  const refs = React.useMemo<BoxBotRefs>(
    () => ({
      botHoverRef,
      fallPivotRef,
      fallRef,
      getUpRef,
      hoppingCooldownRef,
      hoppingRef,
      jumpRef,
      leftArmRef,
      leftLegRef,
      marchingRef,
      postureRef,
      rightArmRef,
      rightLegRef,
      rootRef,
      spinActionRef,
      spinRef,
      walkingBobRef,
      walkingRef,
    }),
    [
      botHoverRef,
      fallPivotRef,
      fallRef,
      getUpRef,
      hoppingCooldownRef,
      hoppingRef,
      jumpRef,
      leftArmRef,
      leftLegRef,
      marchingRef,
      postureRef,
      rightArmRef,
      rightLegRef,
      rootRef,
      spinActionRef,
      spinRef,
      walkingBobRef,
      walkingRef,
    ],
  )

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
