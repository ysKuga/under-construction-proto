import { RefObject } from 'react'

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { FogMode } from '../../_stores/fog/types'

export type UseDebugPanelReturn = {
  /** 移動可能マスの表示演出 */
  displayMode: MoveTargetDisplayMode
  /** 歩行モーションの有無 */
  enableWalking: boolean
  /** 霧の適用範囲の初期値（select の `defaultValue`） */
  fogModeDefault: FogMode
  /** 「生成」クリック時。入力欄の seed で盤面を生成し直す */
  handleGenerateClick: () => void
  /** 「再生成」クリック時。新しい seed をランダムに選んで盤面を生成し直す */
  handleRegenerateClick: () => void
  /** 「リセット」クリック時。全 store（position/items 等）を初期状態に戻す */
  handleReset: () => void
  /** 盤面生成の seed（未指定なら既定の固定配置） */
  seed: number | undefined
  /** seed 入力欄 */
  seedInputRef: RefObject<HTMLInputElement | null>
  /** 移動可能マスの表示演出を切り替える */
  setDisplayMode: (displayMode: MoveTargetDisplayMode) => void
  /** 歩行モーションの有無を切り替える */
  setEnableWalking: (enableWalking: boolean) => void
  /** 霧の適用範囲を切り替える */
  setFogMode: (mode: FogMode) => void
  /** 到達済み表示の有無を切り替える */
  setShowVisited: (show: boolean) => void
}
