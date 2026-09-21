'use client'

import { Button } from '@/components/ui/button'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import {
  useEnergyEventDispatcher,
  useEnergyStore,
  useEnergyStoreApi,
} from '../../_stores/energy'

/**
 * EN 残量調整デバッグパネル
 *
 * - 境界値テスト用（issue-181-en backlog）。EN 残量を 1 ずつ増減し、\
 *   EN 切れ等の任意の残量を作れる
 * - リセットは対象外。ゲーム全体のリセットボタン（別途用意予定）が担う範囲で、\
 *   EN store 単体のリセットは想定しない
 * - proto-01/03 共通。単一の親に属さないため `_prototypes/_components/` へ配置
 * - `-1` は `Energy-consume` イベント経由（consume 実処理・`Energy-depleted` 発行は\
 *   consume-listener が担う。proto-01 の `use-find-path-tick` と同じ経路のため、\
 *   デバッグパネル操作でも EN 切れ演出（予防姿勢）を検証できる）。`+1`（回復）は\
 *   イベント未導入のため対象外（decision-records.md 2026-09-20）
 */
export const EnergyDebugPanel = () => {
  const energyStoreApi = useEnergyStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <span>
        EN 調整: {energyInfo.current}/{energyInfo.max}
      </span>
      <Button
        onClick={() =>
          void energyDispatch['Energy-consume']({
            actorId: PLAYER_ACTOR_ID,
            amount: 1,
          })
        }
        type="button"
        variant="outline"
      >
        -1
      </Button>
      <Button
        onClick={() => energyStoreApi.getState().recover(PLAYER_ACTOR_ID, 1)}
        type="button"
        variant="outline"
      >
        +1
      </Button>
    </div>
  )
}
