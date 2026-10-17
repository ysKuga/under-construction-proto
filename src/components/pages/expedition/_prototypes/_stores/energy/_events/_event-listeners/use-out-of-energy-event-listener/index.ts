import { useRef } from 'react'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { ENERGY_OUT_DELAY_MS } from '../../../constants'
import { useEnergyEventTarget } from '../../_contexts/event-context'
import { useEnergyEventListener } from '../../_hooks/use-energy-event-listener'
import { getEnergyOut } from '../../_registries'

/**
 * Energy-depleted/Energy-recovered を購読し、EN 切れ演出（予防姿勢）を発火・復帰させる
 *
 * - 発火中フラグは actorId キー付きの ref（`Record<ActorId, boolean>`）で一元管理する。
 *   購読自体が scope 全体で 1 回だけのため、mob ごとに「自分（担当 actorId）宛てか」を
 *   比較する必要がない（issue-181-en backlog）
 * - 対象 actor の energyOut dispatcher は `useRegisterEnergyOut` が登録した
 *   レジストリから引く。未登録（energyOut 省略）の actor は何もしない
 */
export const useOutOfEnergyEventListener = () => {
  const eventTarget = useEnergyEventTarget()
  const outOfEnergyByIdRef = useRef<Partial<Record<ActorId, boolean>>>({})

  useEnergyEventListener('Energy-depleted', (event) => {
    const { actorId } = event.detail
    const energyOut = getEnergyOut(eventTarget, actorId)

    if (!energyOut || outOfEnergyByIdRef.current[actorId]) return

    outOfEnergyByIdRef.current[actorId] = true
    setTimeout(() => void energyOut(), ENERGY_OUT_DELAY_MS)
  })

  useEnergyEventListener('Energy-recovered', (event) => {
    const { actorId } = event.detail
    const energyOut = getEnergyOut(eventTarget, actorId)

    if (!energyOut || !outOfEnergyByIdRef.current[actorId]) return

    outOfEnergyByIdRef.current[actorId] = false
    void energyOut()
  })
}
