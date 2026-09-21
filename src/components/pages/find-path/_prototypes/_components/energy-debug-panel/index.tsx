'use client'

import { Button } from '@/components/ui/button'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useEnergyStore, useEnergyStoreApi } from '../../_stores/energy'

/**
 * EN 残量調整デバッグパネル
 *
 * - 境界値テスト用（issue-181-en backlog）。EN 残量を 1 ずつ増減し、\
 *   EN 切れ等の任意の残量を作れる
 * - 「リセット」で EN store を初期状態に戻す（各 proto の `EnergyStoreProvider`\
 *   スコープ内のみ、proto-01/03 で個別に効く）
 * - proto-01/03 共通。単一の親に属さないため `_prototypes/_components/` へ配置
 */
export const EnergyDebugPanel = () => {
  const energyStoreApi = useEnergyStoreApi()
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <span>
        EN 調整: {energyInfo.current}/{energyInfo.max}
      </span>
      <Button
        onClick={() => energyStoreApi.getState().consume(PLAYER_ACTOR_ID, 1)}
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
      <Button
        onClick={() => energyStoreApi.getState().reset()}
        type="button"
        variant="destructive"
      >
        リセット
      </Button>
    </div>
  )
}
