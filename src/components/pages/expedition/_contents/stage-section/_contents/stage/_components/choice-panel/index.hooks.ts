import { useChoicePanelRef } from './_hooks/use-choice-panel-ref'
import { useEnergyChoices } from './_hooks/use-energy-choices'
import { useHandleEnergySpotSelect } from './_hooks/use-handle-energy-spot-select'
import { useHandleExecuteSelect } from './_hooks/use-handle-execute-select'
import { useRescue } from './_hooks/use-rescue'
import { useRouteChoices } from './_hooks/use-route-choices'
import { UseChoicePanelContentReturn } from './index.types'

/** 選択肢（経路・EN）と各選択時の処理・揺れを配線する */
export const useChoicePanelContent = (): UseChoicePanelContentReturn => {
  /** 「実行」の選択時。表示中の経路に沿って自動移動を開始する */
  const handleExecuteSelect = useHandleExecuteSelect()
  /** 「EN スポットの使用」の選択時 */
  const handleEnergySpotSelect = useHandleEnergySpotSelect()
  const { handleRescueSelect, rescueItemKind } = useRescue()
  /** 経路提示中に並べる選択肢 */
  const routeChoices = useRouteChoices(handleExecuteSelect)
  /** EN に関わる選択肢 */
  const energyChoices = useEnergyChoices({
    handleEnergySpotSelect,
    handleRescueSelect,
    rescueItemKind,
  })

  /** 選択肢パネルの imperative API。操作の拒否で揺らす */
  const choicePanelRef = useChoicePanelRef()

  return {
    choicePanelRef,
    choices: [...routeChoices, ...energyChoices],
    handleEnergySpotSelect,
    handleExecuteSelect,
    handleRescueSelect,
    rescueItemKind,
  }
}
