'use client'

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { FogMode } from '../../_stores/fog/types'

import { EnergySliders } from './_components/energy-sliders'
import { MotionSliders } from './_components/motion-sliders'
import { useDebugPanel } from './index.hooks'

/** 「初期表示」select の選択肢 */
const FOG_MODE_OPTIONS: readonly { label: string; value: FogMode }[] = [
  { label: 'すべて表示', value: 'all-visible' },
  { label: 'すべて非表示', value: 'all-hidden' },
  { label: '部分的に非表示', value: 'partial' },
]

/**
 * デバッグ要素（表示設定の切替・リセット・盤面生成・EN 調整・歩行モーション調整）
 *
 * - 本実装（`_contents/index.tsx`）には並べず、story で基本構成の下へ並べる
 * - `<details>` でアコーディオン状に開閉する
 * - 霧・歩行モーション・移動可能マス表示は各 store へ書き込み、stage content が購読する
 * - 盤面生成（issue #315）: seed 入力欄の値で「生成」、新しい seed をランダムに選んで「再生成」する。\
 *   生成で配下ごと再マウントされるため、入力欄は `defaultValue` で現在の seed を表示する
 */
export const DebugPanel = () => {
  const {
    displayMode,
    enableWalking,
    fogModeDefault,
    handleGenerateClick,
    handleRegenerateClick,
    handleReset,
    seed,
    seedInputRef,
    setDisplayMode,
    setEnableWalking,
    setFogMode,
    setShowVisited,
  } = useDebugPanel()

  return (
    <details className="bg-white p-4" open>
      <summary>デバッグ</summary>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
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
        <button onClick={handleReset} type="button">
          リセット
        </button>
        <label>
          seed{' '}
          <input
            defaultValue={seed}
            placeholder="既定"
            ref={seedInputRef}
            style={{ width: 80 }}
            type="number"
          />
        </label>
        <button onClick={handleGenerateClick} type="button">
          生成
        </button>
        <button onClick={handleRegenerateClick} type="button">
          再生成
        </button>
        <EnergySliders />
        <MotionSliders />
      </div>
    </details>
  )
}
