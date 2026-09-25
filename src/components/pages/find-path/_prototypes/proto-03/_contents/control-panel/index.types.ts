import { EnergyInfo } from '@/components/pages/find-path/_prototypes/_stores/energy/types'

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { FogMode } from '../../_stores/fog/types'

export type ControlPanelProps = {
  /** 「リセット」。全 store（position/items 等）を初期状態に戻す */
  onReset: () => void
}

export type UseControlPanelReturn = {
  /** 移動可能マスの表示演出 */
  displayMode: MoveTargetDisplayMode
  /** 歩行モーションの有無 */
  enableWalking: boolean
  /** player の EN 残量・上限 */
  energyInfo: EnergyInfo
  /** 霧の適用範囲の初期値（select の `defaultValue`） */
  fogModeDefault: FogMode
  /** ゴールへ到達済みか */
  goalReached: boolean
  /** 「完了」クリック時。中継点選択モードを終了し通常状態へ戻る */
  handleWaypointDoneClick: () => void
  /** 中継点選択モード中か */
  isSelectingWaypoint: boolean
  /** 移動可能マスの表示演出を切り替える */
  setDisplayMode: (displayMode: MoveTargetDisplayMode) => void
  /** 歩行モーションの有無を切り替える */
  setEnableWalking: (enableWalking: boolean) => void
  /** 霧の適用範囲を切り替える */
  setFogMode: (mode: FogMode) => void
  /** 到達済み表示の有無を切り替える */
  setShowVisited: (show: boolean) => void
  /** 設置済みの中継点の数 */
  waypointCount: number
}
