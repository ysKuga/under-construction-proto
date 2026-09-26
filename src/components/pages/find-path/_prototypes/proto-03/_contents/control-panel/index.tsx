'use client'

import { WaypointSelectingIndicator } from '../../_components/waypoint-selecting-indicator'
import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { FogMode } from '../../_stores/fog/types'

import { useControlPanel } from './index.hooks'
import { ControlPanelProps } from './index.types'

/** 「初期表示」select の選択肢 */
const FOG_MODE_OPTIONS: readonly { label: string; value: FogMode }[] = [
  { label: 'すべて表示', value: 'all-visible' },
  { label: 'すべて非表示', value: 'all-hidden' },
  { label: '部分的に非表示', value: 'partial' },
]

/**
 * 操作パネル（表示設定の切替・EN・リセット・ゴール到達・中継点選択状況）
 *
 * - 霧・歩行モーション・移動可能マス表示は各 store へ書き込み、stage content が購読する
 * - 中継点選択モード中は `WaypointSelectingIndicator`（「完了」ボタン）を表示する
 */
export const ControlPanel = (props: ControlPanelProps) => {
  const { onReset } = props
  const {
    displayMode,
    enableWalking,
    energyInfo,
    fogModeDefault,
    goalReached,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    setDisplayMode,
    setEnableWalking,
    setFogMode,
    setShowVisited,
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
        EN: {energyInfo.current}/{energyInfo.max}
      </span>
      <button onClick={onReset} type="button">
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
