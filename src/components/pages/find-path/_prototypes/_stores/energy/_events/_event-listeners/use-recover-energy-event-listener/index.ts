import { useEnergyStoreApi } from '../../../_contexts/store-context'
import { useEnergyEventDispatcher } from '../../_hooks/use-energy-event-dispatcher'
import { useEnergyEventListener } from '../../_hooks/use-energy-event-listener'

/**
 * Energy-recover イベントを購読し、EN を回復する
 *
 * - 回復後の残量が 0 より大きくなったら Energy-recovered を発行する
 */
export const useRecoverEnergyEventListener = () => {
  const energy = useEnergyStoreApi()
  const dispatch = useEnergyEventDispatcher()

  useEnergyEventListener('Energy-recover', (event) => {
    const { actorId, amount } = event.detail

    energy.getState().recover(actorId, amount)

    if (energy.getState().getEnergyInfo(actorId).current > 0) {
      void dispatch['Energy-recovered']({ actorId })
    }
  })
}
