'use client'

import { CSSProperties } from 'react'

import { term } from '@/features/term-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useEnergyEventDispatcher, useEnergyStore } from '../../_stores/energy'

/**
 * EN 残量調整デバッグパネル
 *
 * - 境界値テスト用（issue-181-en backlog）。EN 残量をスライダー（`type="range"`）で\
 *   増減し、EN 切れ等の任意の残量を作れる
 * - リセットは対象外。ゲーム全体のリセットボタン（別途用意予定）が担う範囲で、\
 *   EN store 単体のリセットは想定しない
 * - proto-01/03 共通。単一の親に属さないため `_prototypes/_components/` へ配置
 * - EN 残量はここでのみ購読する。EN 変化で再レンダリングされるのは本パネルのみ
 * - スライダー値と現在の残量の差分を `Energy-consume`/`Energy-charge` イベントで発行（実処理・\
 *   `Energy-depleted`/`Energy-recovered` 発行は consume/charge-listener が担う。\
 *   proto-01 の `use-find-path-tick` と同じ経路のため、デバッグパネル操作でも\
 *   EN 切れ演出（予防姿勢）の発火・復帰を検証できる）
 */
type EnergyDebugPanelProps = {
  /** label のスタイル（`Stage07` のスライダー列へ揃える場合等、省略可） */
  style?: CSSProperties
}

export const EnergyDebugPanel = ({ style }: EnergyDebugPanelProps) => {
  const energyDispatch = useEnergyEventDispatcher()
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )

  return (
    <label style={style}>
      {term.energy.abbreviation}{' '}
      <input
        max={energyInfo.max}
        min={0}
        onChange={(e) => {
          /** スライダー値と現在の EN 残量の差分(正: 補給 / 負: 消費) */
          const diff = Number(e.target.value) - energyInfo.current

          // 差分なし: イベントを発行しない
          if (diff === 0) return

          void energyDispatch[diff > 0 ? 'Energy-charge' : 'Energy-consume']({
            actorId: PLAYER_ACTOR_ID,
            amount: Math.abs(diff),
          })
        }}
        step={1}
        type="range"
        value={energyInfo.current}
      />{' '}
      {energyInfo.current}/{energyInfo.max}
    </label>
  )
}
