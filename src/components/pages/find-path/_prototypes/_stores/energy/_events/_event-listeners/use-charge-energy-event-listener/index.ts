import { useEnergyStoreApi } from '../../../_contexts/store-context'
import { useEnergyEventDispatcher } from '../../_hooks/use-energy-event-dispatcher'
import { useEnergyEventListener } from '../../_hooks/use-energy-event-listener'

/**
 * Energy-charge イベントを購読し、EN を補給する
 *
 * - 補給後の残量が 0 より大きくなったら Energy-recovered を発行する
 */
export const useChargeEnergyEventListener = () => {
  const energy = useEnergyStoreApi()
  const dispatch = useEnergyEventDispatcher()

  useEnergyEventListener('Energy-charge', (event) => {
    const { actorId, amount } = event.detail

    energy.getState().charge(actorId, amount)

    if (energy.getState().getEnergyInfo(actorId).current > 0) {
      void dispatch['Energy-recovered']({ actorId })
    }
  })
}
