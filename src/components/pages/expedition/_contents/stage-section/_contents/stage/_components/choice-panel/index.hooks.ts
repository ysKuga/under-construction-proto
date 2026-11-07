import { useChoicePanelRef } from './_hooks/use-choice-panel-ref'
import { useChoices } from './_hooks/use-choices'
import { UseChoicePanelContentReturn } from './index.types'

/** 登録済みの選択肢と揺れを配線する */
export const useChoicePanelContent = (): UseChoicePanelContentReturn => {
  /** パネルへ並べる選択肢 */
  const choices = useChoices()
  /** 選択肢パネルの imperative API。操作の拒否で揺らす */
  const choicePanelRef = useChoicePanelRef()

  return { choicePanelRef, choices }
}
