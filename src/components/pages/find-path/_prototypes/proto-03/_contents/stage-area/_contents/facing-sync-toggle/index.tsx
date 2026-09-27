'use client'

import { Pin, RefreshCw } from 'lucide-react'

import { useFacingSyncToggle } from './index.hooks'

/**
 * 独立 bot の向きの同期・固定を切り替えるアイコンボタン
 *
 * - 同期中は同期アイコン、固定中は pin アイコンを表示する
 * - 操作パネルの「状態表示の向きを同期」と同じ設定を切り替える
 */
export const FacingSyncToggle = () => {
  const { syncStandaloneBotFacing, toggleSyncStandaloneBotFacing } =
    useFacingSyncToggle()
  /** 現在の状態を示すラベル */
  const label = syncStandaloneBotFacing ? '向き: 同期' : '向き: 固定'

  return (
    <button
      aria-label={label}
      aria-pressed={syncStandaloneBotFacing}
      className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-100"
      onClick={toggleSyncStandaloneBotFacing}
      title={label}
      type="button"
    >
      {syncStandaloneBotFacing ? <RefreshCw size={16} /> : <Pin size={16} />}
    </button>
  )
}
