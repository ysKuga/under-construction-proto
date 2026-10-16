import { useEnergyStoreApi } from '../../../_contexts/store-context'
import { useEnergyEventDispatcher } from '../../_hooks/use-energy-event-dispatcher'
import { useEnergyEventListener } from '../../_hooks/use-energy-event-listener'

/**
 * Energy-consume イベントを購読し、EN を消費する
 *
 * - 消費後の残量が 0 以下になったら Energy-depleted を発行する
 */
export const useConsumeEnergyEventListener = () => {
  const energy = useEnergyStoreApi()
  const dispatch = useEnergyEventDispatcher()

  useEnergyEventListener('Energy-consume', (event) => {
    const { actorId, amount } = event.detail

    energy.getState().consume(actorId, amount)

    if (energy.getState().getEnergyInfo(actorId).current <= 0) {
      void dispatch['Energy-depleted']({ actorId })
    }
  })
}
