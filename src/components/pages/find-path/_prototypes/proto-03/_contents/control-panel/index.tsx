'use client'

import { WaypointSelectingIndicator } from '../../_components/waypoint-selecting-indicator'
import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { FogMode } from '../../_stores/fog/types'

import { useControlPanel } from './index.hooks'

/** 「初期表示」select の選択肢 */
const FOG_MODE_OPTIONS: readonly { label: string; value: FogMode }[] = [
  { label: 'すべて表示', value: 'all-visible' },
  { label: 'すべて非表示', value: 'all-hidden' },
  { label: '部分的に非表示', value: 'partial' },
]

/**
 * 操作パネル（表示設定の切替・携行アイテム・リセット・ゴール到達・中継点選択状況）
 *
 * - 霧・歩行モーション・移動可能マス表示・状態表示の向き同期は各 store へ書き込み、stage content が購読する
 * - 携行数を `携行: n/上限` で表示し、「使用」で1つ使用する（携行数 0 なら disabled）
 * - 中継点選択モード中は `WaypointSelectingIndicator`（「完了」ボタン）を表示する
 */
export const ControlPanel = () => {
  const {
    carriedCapacity,
    carriedCount,
    displayMode,
    enableWalking,
    fogModeDefault,
    goalReached,
    handleReset,
    handleUseCarriedItemClick,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    setDisplayMode,
    setEnableWalking,
    setFogMode,
    setShowVisited,
    setSyncStandaloneBotFacing,
    syncStandaloneBotFacing,
    waypointCount,
  } = useControlPanel()

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <label>
        初期表示{' '}
        <select
          defaultValue={fogModeDefault}
          onChange={(event) => setFogMode(event.target.value as FogMode)}
        >
          {FOG_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <input
          defaultChecked
          onChange={(event) => setShowVisited(event.target.checked)}
          type="checkbox"
        />{' '}
        到達済みマスを表示する
      </label>
      <label>
        <input
          checked={enableWalking}
          onChange={(event) => setEnableWalking(event.target.checked)}
          type="checkbox"
        />{' '}
        歩行モーション
      </label>
      <label>
        <input
          checked={syncStandaloneBotFacing}
          onChange={(event) => setSyncStandaloneBotFacing(event.target.checked)}
          type="checkbox"
        />{' '}
        状態表示の向きを同期
      </label>
      <label>
        移動可能マス表示{' '}
        <select
          onChange={(event) =>
            setDisplayMode(event.target.value as MoveTargetDisplayMode)
          }
          value={displayMode}
        >
          <option value="scatter">散開</option>
          <option value="instant">即時</option>
          <option value="fade">フェード</option>
        </select>
      </label>
      <span>
        携行: {carriedCount}/{carriedCapacity}
      </span>
      <button
        disabled={carriedCount === 0}
        onClick={handleUseCarriedItemClick}
        type="button"
      >
        使用
      </button>
      <button onClick={handleReset} type="button">
        リセット
      </button>
      <span hidden={!goalReached}>🎉 ゴール到達</span>
      <WaypointSelectingIndicator
        onDoneClick={handleWaypointDoneClick}
        visible={isSelectingWaypoint}
      />
      <span hidden={waypointCount === 0}>中継点: {waypointCount}</span>
    </div>
  )
}
