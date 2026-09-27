import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { FogMode } from '../../_stores/fog/types'

export type UseControlPanelReturn = {
  /** 移動可能マスの表示演出 */
  displayMode: MoveTargetDisplayMode
  /** 歩行モーションの有無 */
  enableWalking: boolean
  /** 霧の適用範囲の初期値（select の `defaultValue`） */
  fogModeDefault: FogMode
  /** ゴールへ到達済みか */
  goalReached: boolean
  /** 「リセット」クリック時。全 store（position/items 等）を初期状態に戻す */
  handleReset: () => void
  /** 「完了」クリック時。中継点選択モードを終了し経路提示中へ戻る */
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
  /** 独立 bot の向き同期の有無を切り替える */
  setSyncStandaloneBotFacing: (syncStandaloneBotFacing: boolean) => void
  /** 独立 bot の向きをステージ上の bot と同期するか */
  syncStandaloneBotFacing: boolean
  /** 設置済みの中継点の数 */
  waypointCount: number
}
