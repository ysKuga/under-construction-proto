import { RefObject } from 'react'

import {
  Choice,
  ChoicePanelHandle,
} from '../../../../../../_components/choice-panel/index.types'

export type UseChoicePanelContentReturn = {
  /** `ChoicePanel` の imperative API。操作の拒否で揺らす */
  choicePanelRef: RefObject<ChoicePanelHandle | null>
  /**
   * パネルへ並べる選択肢
   *
   * - 各機能が登録した選択肢（`_stores/choices`）。選択時に `Expedition-choice-select` を発行する
   */
  choices: Choice[]
}
