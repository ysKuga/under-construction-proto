import { useMemo } from 'react'

import { useExpeditionEventDispatcher } from '../../../../../../../_events'
import { useChoicesStore } from '../../../../../../../_stores/choices'
import { UseChoicePanelContentReturn } from '../index.types'

/**
 * 登録済みの選択肢を、選択時に `Expedition-choice-select` を発行する選択肢へ変換する
 *
 * - 選択時の処理は持たない。選択肢を登録した機能が event を購読して処理する
 */
export const useChoices = (): UseChoicePanelContentReturn['choices'] => {
  /** 登録済みの選択肢 */
  const choiceEntries = useChoicesStore((state) => state.choices)
  /** 選択の event（`Expedition-choice-select`）の発行に使う */
  const expeditionEventDispatcher = useExpeditionEventDispatcher()

  return useMemo(
    () =>
      choiceEntries.map(({ id, label, pressed }) => ({
        id,
        label,
        onSelect: () =>
          void expeditionEventDispatcher['Expedition-choice-select']({ id }),
        pressed,
      })),
    [choiceEntries, expeditionEventDispatcher],
  )
}
