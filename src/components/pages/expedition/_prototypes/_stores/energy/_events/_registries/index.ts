import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/** EventTarget・actorId ごとの EN 切れ演出 dispatcher */
const energyOutRegistry = new WeakMap<
  EventTarget,
  Map<ActorId, () => Promise<void>>
>()

/**
 * actor の energyOut dispatcher を登録する
 *
 * - mob ごとに `useRegisterEnergyOut` から呼ばれる。`useOutOfEnergyEventListener`
 *   （scope 全体で 1 回だけマウント）が `Energy-depleted`/`Energy-recovered` 受信時に
 *   actorId をキーとして引く（issue-181-en backlog）
 */
export const registerEnergyOut = (
  target: EventTarget,
  actorId: ActorId,
  energyOut: () => Promise<void>,
) => {
  const registry =
    energyOutRegistry.get(target) ?? new Map<ActorId, () => Promise<void>>()

  registry.set(actorId, energyOut)
  energyOutRegistry.set(target, registry)
}

/** actor の energyOut dispatcher を解除する */
export const unregisterEnergyOut = (target: EventTarget, actorId: ActorId) => {
  energyOutRegistry.get(target)?.delete(actorId)
}

/** actor の energyOut dispatcher を取得する（未登録なら undefined） */
export const getEnergyOut = (target: EventTarget, actorId: ActorId) =>
  energyOutRegistry.get(target)?.get(actorId)
