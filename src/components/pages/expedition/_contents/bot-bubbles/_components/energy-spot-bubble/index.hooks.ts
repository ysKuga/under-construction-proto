import { useCallback, useRef } from 'react'

import { EnergySpotBubbleHandle } from '../../../../_components/energy-spot-bubble'
import {
  useExpeditionEventDispatcher,
  useExpeditionEventListener,
} from '../../../../_events'

import { UseEnergySpotBubbleContentReturn } from './index.types'

/** EN スポット吹き出しの揺れ・使用操作をまとめる */
export const useEnergySpotBubbleContent =
  (): UseEnergySpotBubbleContentReturn => {
    const bubbleRef = useRef<EnergySpotBubbleHandle>(null)
    const expeditionEventDispatcher = useExpeditionEventDispatcher()

    /** 吹き出しを揺らす */
    const shake = useCallback(() => {
      bubbleRef.current?.shake()
    }, [])

    // bot 頭上の吹き出しを揺らす要求: 非表示中の揺れは見えないため条件を設けない
    useExpeditionEventListener('Expedition-shake-bot-bubble', shake, {
      allowMultiple: true,
    })

    const handleClick = useCallback(async () => {
      /** listener が使用を受理したか */
      const accepted =
        await expeditionEventDispatcher['Expedition-use-energy-spot'](undefined)

      // 拒否された: 吹き出しを揺らして知らせる
      if (!accepted) {
        await expeditionEventDispatcher['Expedition-shake-bot-bubble'](
          undefined,
        )
      }
    }, [expeditionEventDispatcher])

    return { bubbleRef, handleClick }
  }
