import { useEnergySpotChoice } from './energy-spot'
import { useRescueChoice } from './rescue'
import { useRouteChoices } from './route'

/**
 * 選択肢パネルへの選択肢の登録・選択の処理をまとめて有効化する
 *
 * - 新しい選択肢（`_choices/<機能>/`）を追加する際は、ここに呼び出しを足すだけでよい
 * - `index.providers.tsx` の `ChoicesStoreProvider` の内側へ置く（`ExpeditionEventListeners` と同じ扱い）
 *   - 処理が使う store・ステージの handle の Provider より内側にする
 */
export const ExpeditionChoices = () => {
  useRouteChoices()
  useEnergySpotChoice()
  useRescueChoice()

  return null
}
