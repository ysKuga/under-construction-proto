import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `Energy-`
 */
export type EnergyEventMap = {
  /** EN を消費する */
  'Energy-consume': { actorId: ActorId; amount: number }
  /** EN が尽きた（消費後の残量が 0 以下になった） */
  'Energy-depleted': { actorId: ActorId }
  /** EN を回復する */
  'Energy-recover': { actorId: ActorId; amount: number }
  /** EN が回復した（回復後の残量が 0 より大きくなった） */
  'Energy-recovered': { actorId: ActorId }
}
