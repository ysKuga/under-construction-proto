'use client'

import { WaypointSelectingIndicator } from '../../_components/waypoint-selecting-indicator'

import { useStatusPanel } from './index.hooks'

/**
 * 状態表示（ゴール到達・中継点選択状況）
 *
 * - 中継点選択モード中は `WaypointSelectingIndicator`（「完了」ボタン）を表示する
 */
export const StatusPanel = () => {
  const {
    goalReached,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    waypointCount,
  } = useStatusPanel()

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <span hidden={!goalReached}>🎉 ゴール到達</span>
      <WaypointSelectingIndicator
        onDoneClick={handleWaypointDoneClick}
        visible={isSelectingWaypoint}
      />
      <span hidden={waypointCount === 0}>中継点: {waypointCount}</span>
    </div>
  )
}
