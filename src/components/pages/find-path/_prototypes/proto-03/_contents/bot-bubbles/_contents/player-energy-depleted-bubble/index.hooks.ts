import { RefObject, useCallback, useRef } from 'react'

import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { EnergyDepletedBubbleHandle } from '../../../../_components/energy-depleted-bubble'
import { useFindPathEventListener } from '../../../../_events'

type UsePlayerEnergyDepletedBubbleReturn = {
  /** `EnergyDepletedBubble` の imperative API。揺れを ref 経由で命令する */
  bubbleRef: RefObject<EnergyDepletedBubbleHandle | null>
  /** bot 頭上のオーバーレイ注入先コンテナ DOM（actors store） */
  overlayContainer?: HTMLDivElement
  /** 吹き出しを揺らす */
  shake: () => void
  /** 吹き出しを表示するか（player が EN 切れ中） */
  visible: boolean
}

/** player の EN 切れ吹き出しの表示・揺れをまとめる */
export const usePlayerEnergyDepletedBubble =
  (): UsePlayerEnergyDepletedBubbleReturn => {
    const bubbleRef = useRef<EnergyDepletedBubbleHandle>(null)
    const overlayContainer = useActorsStore(
      (state) => state.overlayContainers[PLAYER_ACTOR_ID],
    )
    const visible = useEnergyStore(
      (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current <= 0,
    )

    const shake = useCallback(() => {
      bubbleRef.current?.shake()
    }, [])

    // bot 頭上の吹き出しを揺らす要求: 非表示中の揺れは見えないため条件を設けない
    useFindPathEventListener('FindPath-shake-bot-bubble', shake, {
      allowMultiple: true,
    })

    return { bubbleRef, overlayContainer, shake, visible }
  }
