import { useEffect } from 'react'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { useEnergyEventTarget } from '../_events'
import { registerEnergyOut, unregisterEnergyOut } from '../_events/_registries'

type UseRegisterEnergyOutOptions = {
  /** 対象 actor */
  actorId: ActorId
  /** box-bot-01 の energyOut action dispatcher(省略時は EN 切れ演出を再生しない) */
  energyOut?: () => Promise<void>
}

/**
 * actor の energyOut action dispatcher を登録する
 *
 * - EN 切れ演出（`Energy-depleted`/`Energy-recovered` 購読、予防姿勢の発火・復帰）自体は
 *   `useOutOfEnergyEventListener`（scope 全体で 1 回だけマウント）が一元的に担う。
 *   呼び出し元（mob 単位）はここで自分の energyOut 関数をマウント中だけ actorId
 *   キーで登録するだけでよい
 * - `useBoxBotActionDispatcher` は 1 bot = 1 `EventTarget` の設計のため、mob ごとに
 *   この hook を呼べば個別に登録できる（issue-181-en backlog: mob の EN 個別化）
 * - proto-01（`use-find-path-tick`）・proto-03（`FindPathProto03Content`）で
 *   完全に同型だった実装を共通化した(issue-181-en)
 */
export const useRegisterEnergyOut = (options: UseRegisterEnergyOutOptions) => {
  const { actorId, energyOut } = options
  const eventTarget = useEnergyEventTarget()

  useEffect(() => {
    if (!energyOut) return

    registerEnergyOut(eventTarget, actorId, energyOut)

    return () => unregisterEnergyOut(eventTarget, actorId)
  }, [actorId, energyOut, eventTarget])
}
