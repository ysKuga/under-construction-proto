import { Actor } from '@/types/theater/actor'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `Energy-`
 */
export type EnergyEventMap = {
  /** EN を消費する */
  'Energy-consume': { actorId: Actor['id']; amount: number }
  /** EN が尽きた（消費後の残量が 0 以下になった） */
  'Energy-depleted': { actorId: Actor['id'] }
  /** EN を補給する */
  'Energy-charge': { actorId: Actor['id']; amount: number }
  /** EN 切れから復帰した（補給後の残量が 0 より大きくなった） */
  'Energy-recovered': { actorId: Actor['id'] }
}
