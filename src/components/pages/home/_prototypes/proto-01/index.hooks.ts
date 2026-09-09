import { useState } from 'react'

import { useBoxBotActionDispatcher } from '@/components/samples/figure/box-bot'
import { useCssBooleanCell } from '@/hooks/use-css-boolean-cell'

import { useWalkUnlock } from './_hooks/use-walk-unlock'
import type { UseProto01Return } from './index.types'

/**
 * Proto01 の挙動
 *
 * - box-bot と共有する EventTarget を生成する
 * - `ACTION_JUMP` 起点の解放判定（`useWalkUnlock`）を hidden checkbox の CSS state セルへ流す
 * - walking action の発火をまとめる
 */
export const useProto01 = (): UseProto01Return => {
  /** box-bot と共有し、walking action を発火する EventTarget */
  const [eventTarget] = useState(() => new EventTarget())
  const { walkingToggle } = useBoxBotActionDispatcher(eventTarget)

  const { checkboxRef, set } = useCssBooleanCell()
  useWalkUnlock(eventTarget, set)

  const [walking, setWalking] = useState(false)

  const toggleWalking = () => {
    void walkingToggle()
    setWalking((v) => !v)
  }

  return { eventTarget, toggleWalking, walking, walkUnlockedRef: checkboxRef }
}
