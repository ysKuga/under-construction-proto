'use client'

import { SLIDER_LABEL_STYLE } from '@/prototypes/stage/stage-07/constants'

import { EnergyDebugPanel } from '../../../../../../../_components/energy-debug-panel'
import { useEnergySettingsStore } from '../../../../../../_stores/energy-settings'

/**
 * EN 関連の調整スライダー（EN 残量・EN 消費量）
 *
 * - `Stage07` の `extraSliders` へ渡し、組込みスライダー（体の上下量）の後に並べる
 * - EN 消費量は `energy-settings` store へ書き込み、移動成立時の処理が読む（0 で EN 無限）
 * - EN 残量・消費量の購読は本コンポーネント内に閉じ、変化時に `Stage07` を再レンダリングさせない
 */
export const EnergySliders = () => {
  /** 移動 1 マスあたりの EN 消費量。0 で EN 無限 */
  const consumePerMove = useEnergySettingsStore((state) => state.consumePerMove)
  /** 移動 1 マスあたりの EN 消費量を切り替える */
  const setConsumePerMove = useEnergySettingsStore(
    (state) => state.setConsumePerMove,
  )

  return (
    <>
      <EnergyDebugPanel style={SLIDER_LABEL_STYLE} />
      <label style={SLIDER_LABEL_STYLE}>
        EN 消費量{' '}
        <input
          max={5}
          min={0}
          onChange={(event) => setConsumePerMove(Number(event.target.value))}
          step={1}
          type="range"
          value={consumePerMove}
        />{' '}
        {consumePerMove === 0 ? '無限' : consumePerMove}
      </label>
    </>
  )
}
