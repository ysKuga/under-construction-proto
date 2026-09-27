'use client'

import { Pin, RefreshCw } from 'lucide-react'

import { useFacingSyncToggle } from './index.hooks'

/** hover 中（クリック直後の抑止中を除く）に現在の状態のアイコンを隠す */
const CURRENT_ICON_CLASS = 'group-[:hover:not([data-hover-suppressed])]:hidden'

/** hover 中（クリック直後の抑止中を除く）のみ変更先のアイコンを表示する */
const NEXT_ICON_CLASS =
  'hidden group-[:hover:not([data-hover-suppressed])]:block'

/**
 * 独立 bot の向きの同期・固定を切り替えるアイコンボタン
 *
 * - 同期中は同期アイコン、固定中は pin アイコンを表示する
 * - hover 中は変更先のアイコン・title を表示する。クリック直後は hover を一度外すまで現在の状態のアイコンのまま
 * - 操作パネルの「状態表示の向きを同期」と同じ設定を切り替える
 */
export const FacingSyncToggle = () => {
  const { handleClick, handleMouseLeave, syncStandaloneBotFacing } =
    useFacingSyncToggle()
  /** 現在の状態を示すラベル */
  const label = syncStandaloneBotFacing ? '向き: 同期' : '向き: 固定'
  /** クリックで変更される先を示す title */
  const title = syncStandaloneBotFacing ? '向きを固定する' : '向きを同期する'
  /** 現在の状態のアイコン・変更先のアイコン */
  const [CurrentIcon, NextIcon] = syncStandaloneBotFacing
    ? [RefreshCw, Pin]
    : [Pin, RefreshCw]

  return (
    <button
      aria-label={label}
      aria-pressed={syncStandaloneBotFacing}
      className="group rounded-full border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-100"
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      title={title}
      type="button"
    >
      <CurrentIcon className={CURRENT_ICON_CLASS} size={16} />
      <NextIcon className={NEXT_ICON_CLASS} size={16} />
    </button>
  )
}
