import { useRef } from 'react'
import { match, P } from 'ts-pattern'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { useEnergyEventListener } from '../_events'
import { ENERGY_OUT_DELAY_MS } from '../constants'

type UseOutOfEnergyRefOptions = {
  /** 対象 actor */
  actorId: ActorId
  /** box-bot-01 の energyOut action dispatcher(省略時は EN 切れ演出を再生しない) */
  energyOut?: () => Promise<void>
}

/**
 * EN 切れ演出(予防姿勢)の発火中フラグ
 *
 * - `Energy-depleted` 購読で発火(`ENERGY_OUT_DELAY_MS` だけ遅らせる、演出上のタメ)、\
 *   `Energy-recovered` 購読で即座に復帰させる(トグル方式の action のため)
 * - 回復アイテム/回復スポット到達等、energy store 側イベントを経由しない復帰処理は\
 *   呼び出し元がこの ref を直接操作してよい(proto-01/03 で採用中。今回のリファクタ対象外)
 * - proto-01（`use-find-path-tick`）・proto-03（`FindPathProto03Content`）で\
 *   完全に同型だった実装を共通化した(issue-181-en)
 */
export const useOutOfEnergyRef = (options: UseOutOfEnergyRefOptions) => {
  const { actorId, energyOut } = options
  const outOfEnergyRef = useRef(false)

  // Energy-depleted（energy store 側の consume-listener が EN 消費後に発行）を
  // 購読し、EN 切れ演出（energyOut）を発火する
  useEnergyEventListener('Energy-depleted', (event) => {
    match({ energyOut, event, outOfEnergyRef }).with(
      {
        energyOut: P.nonNullable,
        event: { detail: { actorId } },
        outOfEnergyRef: { current: false },
      },
      ({ energyOut }) => {
        outOfEnergyRef.current = true
        setTimeout(() => void energyOut(), ENERGY_OUT_DELAY_MS)
      },
    )
  })

  // Energy-recovered（energy store 側の recover-listener が EN 回復後に発行。
  // EnergyDebugPanel の +1 経由）を購読し、EN 切れ演出から復帰させる
  useEnergyEventListener('Energy-recovered', (event) => {
    match({ energyOut, event, outOfEnergyRef }).with(
      {
        energyOut: P.nonNullable,
        event: { detail: { actorId } },
        outOfEnergyRef: { current: true },
      },
      ({ energyOut }) => {
        outOfEnergyRef.current = false
        void energyOut()
      },
    )
  })

  return outOfEnergyRef
}
