import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/**
 * energy イベントの actorId が対象と一致するか判定する
 */
export const isEnergyEventForActor = (
  event: CustomEvent<{ actorId: ActorId }>,
  actorId: ActorId,
): boolean => event.detail.actorId === actorId
