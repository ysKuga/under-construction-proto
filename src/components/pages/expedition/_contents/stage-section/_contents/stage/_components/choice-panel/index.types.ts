import { Choice } from '../../../../../../_components/choice-panel/index.types'

export type UseChoicePanelContentReturn = {
  /** パネルへ並べる選択肢。経路提示中のみ実行・中継点・キャンセルを並べる */
  choices: Choice[]
  /** 「実行」の選択時。表示中の経路に沿って自動移動を開始する */
  handleExecuteSelect: () => Promise<void>
}
