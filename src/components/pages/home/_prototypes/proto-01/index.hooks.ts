import { useState } from 'react'

import { useBoxBotActionDispatcher } from '@/components/samples/figure/box-bot'

import { useWalkUnlock } from './_hooks/use-walk-unlock'
import type { UseProto01Return } from './index.types'

/**
 * Proto01 の挙動
 *
 * - box-bot と共有する EventTarget を生成する
 * - `ACTION_JUMP` 起点の解放判定（`useWalkUnlock`）と walking action の発火をまとめる
 */
export const useProto01 = (): UseProto01Return => {
  /** box-bot と共有し、walking action を発火する EventTarget */
  const [eventTarget] = useState(() => new EventTarget())
  const { walkingToggle } = useBoxBotActionDispatcher(eventTarget)

  const { walkUnlocked } = useWalkUnlock(eventTarget)

  const [walking, setWalking] = useState(false)

  const toggleWalking = () => {
    void walkingToggle()
    setWalking((v) => !v)
  }

  return { eventTarget, toggleWalking, walking, walkUnlocked }
}
