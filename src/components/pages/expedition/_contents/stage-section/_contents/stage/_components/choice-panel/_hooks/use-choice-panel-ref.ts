import { useCallback, useRef } from 'react'

import { ChoicePanelHandle } from '../../../../../../../_components/choice-panel/index.types'
import { useExpeditionEventListener } from '../../../../../../../_events'
import { UseChoicePanelContentReturn } from '../index.types'

/**
 * 選択肢パネルの ref。操作の拒否（`Expedition-action-rejected`）でパネルを揺らす
 *
 * - 吹き出し等の他の購読と並ぶため `allowMultiple` で購読する
 */
export const useChoicePanelRef =
  (): UseChoicePanelContentReturn['choicePanelRef'] => {
    /** 選択肢パネルの imperative API */
    const choicePanelRef = useRef<ChoicePanelHandle>(null)

    /** パネルを揺らす */
    const shake = useCallback(() => {
      choicePanelRef.current?.shake()
    }, [])

    // 操作の拒否: 閉じている間の揺れは見えないため条件を設けない
    useExpeditionEventListener('Expedition-action-rejected', shake, {
      allowMultiple: true,
    })

    return choicePanelRef
  }
