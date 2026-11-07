import { useChoicePanelRef } from './_hooks/use-choice-panel-ref'
import { useHandleExecuteSelect } from './_hooks/use-handle-execute-select'
import { useRouteChoices } from './_hooks/use-route-choices'
import { UseChoicePanelContentReturn } from './index.types'

/** 経路提示中の選択肢と「実行」の処理・揺れを配線する */
export const useChoicePanelContent = (): UseChoicePanelContentReturn => {
  /** 「実行」の選択時。表示中の経路に沿って自動移動を開始する */
  const handleExecuteSelect = useHandleExecuteSelect()
  /** 経路提示中に並べる選択肢 */
  const choices = useRouteChoices(handleExecuteSelect)

  /** 選択肢パネルの imperative API。操作の拒否で揺らす */
  const choicePanelRef = useChoicePanelRef()

  return { choicePanelRef, choices, handleExecuteSelect }
}
