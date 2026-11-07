import { RefObject } from 'react'

import {
  Choice,
  ChoicePanelHandle,
} from '../../../../../../_components/choice-panel/index.types'
import { ItemKind } from '../../../../../../_stores/items/types'

export type UseChoicePanelContentReturn = {
  /** `ChoicePanel` の imperative API。操作の拒否で揺らす */
  choicePanelRef: RefObject<ChoicePanelHandle | null>
  /**
   * パネルへ並べる選択肢
   *
   * - 経路提示中: 実行・中継点・キャンセル
   * - EN スポット上で補給できる: EN スポットの使用
   * - EN 切れ中: 救助
   */
  choices: Choice[]
  /**
   * 「EN スポットの使用」の選択時。現在セルの EN スポットで補給する
   *
   * - 拒否されたら通知する（`Expedition-action-rejected`）
   */
  handleEnergySpotSelect: () => Promise<void>
  /** 「実行」の選択時。表示中の経路に沿って自動移動を開始する */
  handleExecuteSelect: () => Promise<void>
  /**
   * 「救助」の選択時。提示中の救済手段を実行する
   *
   * - 拒否されたら通知する（`Expedition-action-rejected`）
   */
  handleRescueSelect: () => Promise<void>
  /**
   * 救済手段として使う手持ちのアイテムの種類
   *
   * - EN 補給を許可された携行アイテムのうち最古のもの。なければ `undefined`\
   *   （チェックポイントへのリセットを提示する）
   */
  rescueItemKind?: ItemKind
}
