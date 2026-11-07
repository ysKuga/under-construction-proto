import { useCallback } from 'react'

import { useExpeditionEventDispatcher } from '../../../../../../../_events'
import { UseChoicePanelContentReturn } from '../index.types'

/**
 * 「EN スポットの使用」の選択時の処理
 *
 * - 受理の判定・補給は `Expedition-use-energy-spot` の listener が担う。拒否されたら通知するのみ
 */
export const useHandleEnergySpotSelect =
  (): UseChoicePanelContentReturn['handleEnergySpotSelect'] => {
    const expeditionEventDispatcher = useExpeditionEventDispatcher()

    return useCallback(async () => {
      /** listener が使用を受理したか */
      const accepted =
        await expeditionEventDispatcher['Expedition-use-energy-spot'](undefined)

      // 拒否された: 拒否を通知する
      if (!accepted) {
        await expeditionEventDispatcher['Expedition-action-rejected'](undefined)
      }
    }, [expeditionEventDispatcher])
  }
