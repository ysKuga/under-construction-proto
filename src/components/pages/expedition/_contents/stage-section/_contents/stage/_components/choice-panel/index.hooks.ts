import { useChoices } from './_hooks/use-choices'
import { useHandleExecuteSelect } from './_hooks/use-handle-execute-select'
import { UseChoicePanelContentReturn } from './index.types'

/** 経路提示中の選択肢と「実行」の処理を配線する */
export const useChoicePanelContent = (): UseChoicePanelContentReturn => {
  /** 「実行」の選択時。表示中の経路に沿って自動移動を開始する */
  const handleExecuteSelect = useHandleExecuteSelect()
  /** 経路提示中に並べる選択肢 */
  const choices = useChoices(handleExecuteSelect)

  return { choices, handleExecuteSelect }
}
