import { useRef, useState } from 'react'

import { useBoxBotActionDispatcher } from '@/components/samples/figure/box-bot'
import { useCssToggle } from '@/hooks/use-css-toggle'

import { useWalkUnlock } from './_hooks/use-walk-unlock'
import type { UseProto01Return } from './index.types'

/**
 * Proto01 の挙動
 *
 * - box-bot と共有する EventTarget を生成する
 * - `ACTION_JUMP` 起点の解放判定（`useWalkUnlock`）を hidden checkbox の CSS state セルへ流す
 * - walking action の発火と、歩く / 止まる ラベル切替（`data-walking` 属性）をまとめる
 */
export const useProto01 = (): UseProto01Return => {
  /** box-bot と共有し、walking action を発火する EventTarget */
  const [eventTarget] = useState(() => new EventTarget())
  const { walkingToggle } = useBoxBotActionDispatcher(eventTarget)

  const walkUnlock = useCssToggle()
  useWalkUnlock(eventTarget, walkUnlock.set)

  /** ラベル切替用に `data-walking` を付け外しする wrapper の ref */
  const walkingRef = useRef<HTMLDivElement>(null)

  const toggleWalking = () => {
    void walkingToggle()
    // 歩く / 止まる ラベルは data-walking + group-data-[walking]: で切替。
    // ref 直書きなので Proto01 は再レンダリングしない
    walkingRef.current?.toggleAttribute('data-walking')
  }

  return {
    eventTarget,
    toggleWalking,
    walkingRef,
    walkUnlock,
  }
}
