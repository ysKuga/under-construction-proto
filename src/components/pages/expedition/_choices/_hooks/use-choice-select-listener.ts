import { useCallback } from 'react'

import { useExpeditionEventListener } from '../../_events'
import { ChoiceEntry } from '../../_stores/choices/types'

/**
 * 選択肢パネルで指定の選択肢が選ばれた時の処理を購読する
 *
 * - 全ての選択肢が `Expedition-choice-select` を購読するため `allowMultiple` で購読する
 *
 * @param id 購読する選択肢の識別子
 * @param onSelect 選ばれた時の処理
 */
export const useChoiceSelectListener = (
  id: ChoiceEntry['id'],
  onSelect: () => void,
) => {
  useExpeditionEventListener(
    'Expedition-choice-select',
    useCallback(
      (event) => {
        // 他の選択肢の選択: 何もしない
        if (event.detail.id !== id) return

        onSelect()
      },
      [id, onSelect],
    ),
    { allowMultiple: true },
  )
}
