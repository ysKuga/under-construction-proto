import { useCallback, useRef } from 'react'

import { EnergyDepletedBubbleHandle } from '../../../../_components/energy-depleted-bubble'
import { useFindPathEventListener } from '../../../../_events'

import { useRescue } from './_hooks/use-rescue'
import { UseEnergyDepletedBubbleContentReturn } from './index.types'

/** EN 切れ吹き出しの揺れ・救済手段をまとめる */
export const useEnergyDepletedBubbleContent =
  (): UseEnergyDepletedBubbleContentReturn => {
    const bubbleRef = useRef<EnergyDepletedBubbleHandle>(null)
    const { handleRescueClick, rescueItemKind } = useRescue()

    /** 吹き出しを揺らす */
    const shake = useCallback(() => {
      bubbleRef.current?.shake()
    }, [])

    // bot 頭上の吹き出しを揺らす要求: 非表示中の揺れは見えないため条件を設けない
    useFindPathEventListener('FindPath-shake-bot-bubble', shake, {
      allowMultiple: true,
    })

    return { bubbleRef, handleRescueClick, rescueItemKind }
  }
