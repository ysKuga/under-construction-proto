import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { ACTION_JUMP } from '../jump/config'
import type { BoxBotActionContext } from '../types'

import { ACTION_HOPPING, type HoppingConfig } from './config'

/** hopping が host から必要とする操作面 */
type HoppingHost = Pick<
  BoxBotActionContext<HoppingConfig>,
  'config' | 'eventTarget' | 'interactive' | 'readPosture'
>

/**
 * 待機演出(連続ジャンプ)toggle action の購読・可視化
 *
 * - `ACTION_HOPPING`(外部 dispatch)を購読し、1 回の dispatch で on/off をトグルする。\
 *   `readPosture() !== 0`(転倒中/横倒し/起き上がり中)の間はトグルを無視する
 * - active 中は `config.intervalSec` ごとに `ACTION_JUMP` を dispatch し、jump action の\
 *   見た目を再利用する。jump 側は実行中(`jumpRef >= 0`)の重複 dispatch を弾くため、\
 *   ここでは着地を待たず固定間隔で撃つだけでよい
 * - 倒れ姿勢へ移行したら撃つのをやめ、get-up で直立に戻れば自動的に再開する\
 *   (`activeRef` のトグル状態は保持する)
 * - `activeRef` / `elapsedRef` は本 action がローカルに持つ。共有 ref は触らない
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useHopping = (host: HoppingHost): void => {
  const { config, eventTarget, interactive, readPosture } = host

  /** 連続ジャンプ中か */
  const activeRef = useRef(false)
  /** 前回 dispatch からの経過秒。-1 のときは次フレームで即撃ちする */
  const elapsedRef = useRef(-1)

  const dispatch = useEventDispatcher(eventTarget)

  const onHopping = () => {
    if (!interactive) return
    if (readPosture() !== 0) return
    activeRef.current = !activeRef.current
    elapsedRef.current = -1
  }

  useEventListener(ACTION_HOPPING, onHopping, { target: eventTarget })

  useFrame((_, dt) => {
    if (!activeRef.current) return

    // 倒れ姿勢中は撃たない(get-up で直立に戻れば次フレームから自動再開)
    if (readPosture() !== 0) {
      elapsedRef.current = -1
      return
    }

    if (elapsedRef.current < 0) {
      elapsedRef.current = 0
      void dispatch(ACTION_JUMP)
      return
    }

    elapsedRef.current += dt
    if (elapsedRef.current >= config.intervalSec) {
      elapsedRef.current = 0
      void dispatch(ACTION_JUMP)
    }
  })
}
