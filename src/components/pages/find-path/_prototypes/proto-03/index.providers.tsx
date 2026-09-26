'use client'

import { PropsWithChildren } from 'react'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07EventProvider } from '@/prototypes/stage/stage-07/_events'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import { ResetProvider } from './_contexts/reset'
import { Stage07HandleProvider } from './_contexts/stage07-handle'
import { VisibilityRegistryProvider } from './_contexts/visibility-registry'
import { FindPathEventProvider } from './_events'
import { DisplaySettingsStoreProvider } from './_stores/display-settings'
import { FogStoreProvider } from './_stores/fog'
import { FollowPathStoreProvider } from './_stores/follow-path'
import { GoalStoreProvider } from './_stores/goal'
import { ItemStoreProvider } from './_stores/items'
import { ItemInstance } from './_stores/items/types'
import { WaypointFlowStoreProvider } from './_stores/waypoint-flow'
import {
  RECOVERY_ITEM_CELLS,
  RECOVERY_SPOT_CELLS,
  START_POSITION,
} from './constants'
import { FindPathProto03Props } from './index.types'

/**
 * 初期配置するアイテム一覧（`RECOVERY_ITEM_CELLS`/`RECOVERY_SPOT_CELLS` から組み立てる）
 *
 * - 回復アイテムは `stock` 未指定（1個ずつ使い切り）、回復スポットは `stock` 指定
 *   （指定回数で枯渇しうる）で区別する（proto-01 と同型）
 */
const INITIAL_ITEMS: ItemInstance[] = [
  ...RECOVERY_ITEM_CELLS.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { q: cell.q, r: cell.r },
    id: `recovery-item-${index}`,
    kind: 'energy-recovery',
  })),
  ...RECOVERY_SPOT_CELLS.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { q: cell.q, r: cell.r },
    id: `recovery-spot-${index}`,
    kind: 'energy-recovery',
    stock: cell.stock,
  })),
]

type FindPathProto03ProvidersProps = PropsWithChildren<FindPathProto03Props>

/**
 * proto-03 のページ全体で共有する Provider（store・event・context）をまとめてネストする
 *
 * - 並び順の制約（それ以外の Provider 間に依存はない）
 *   - `FindPathEventProvider` は `EnergyStoreProvider` の内側に置く\
 *     （EN 判定の listener が energy store を参照するため）
 *   - `VisibilityRegistryProvider` は `FogStoreProvider` の内側に置く\
 *     （fog store を購読するため）
 * - リセット（境界値テスト用、issue #181）: 最外の `ResetProvider`（`_contexts/reset`）が
 *   配下の Provider 群（position 含む）へ `key` を付け、`reset` で丸ごと再マウントする
 *   （proto-01 と同じ方式）。表示設定・霧のモード含め全 store が初期状態へ戻る
 * - `VisibilityRegistryProvider` は未到達マスを非表示にするための Provider（proto-02
 *   の hex 版）。霧の状態・可視判定は `FogStoreProvider`（`_stores/fog`）が持ち、
 *   registry は DOM の登録・反映のみを担う。可視判定は霧セルについて「視界（現在地
 *   基準の6近傍）」または「到達済み表示ONかつ到達済みセル」（`setShowVisited` で
 *   切替可能、既定 ON）。`Stage07`（hex タイルの表示/非表示）・`GoalMarkerLayer`
 *   （旗の表示/非表示）から読めるよう `Stage07` の外側に置く
 * - `ActorsStoreProvider`（hex 版、zustand store）は actorId ごとの現在セルを
 *   保持する Provider。`Stage07` の外側に置く（issue #181 PR-A。tick 駆動実行の
 *   追加に備え、外部からクリックを介さず actor を動かせるようにするため）。
 *   player・mob を区別せず一元管理する（issue #215）
 */
export const FindPathProto03Providers = (
  props: FindPathProto03ProvidersProps,
) => {
  const { children, initialFogMode = 'all-hidden' } = props

  return (
    <ResetProvider>
      <EnergyStoreProvider>
        <FindPathEventProvider>
          <ItemStoreProvider initialItems={INITIAL_ITEMS}>
            <ActorsStoreProvider
              initialActors={{ [PLAYER_ACTOR_ID]: START_POSITION }}
            >
              <Stage07EventProvider>
                <FogStoreProvider initialMode={initialFogMode}>
                  <VisibilityRegistryProvider>
                    <FollowPathStoreProvider>
                      <WaypointFlowStoreProvider>
                        <DisplaySettingsStoreProvider>
                          <GoalStoreProvider>
                            <Stage07HandleProvider>
                              {children}
                            </Stage07HandleProvider>
                          </GoalStoreProvider>
                        </DisplaySettingsStoreProvider>
                      </WaypointFlowStoreProvider>
                    </FollowPathStoreProvider>
                  </VisibilityRegistryProvider>
                </FogStoreProvider>
              </Stage07EventProvider>
            </ActorsStoreProvider>
          </ItemStoreProvider>
        </FindPathEventProvider>
      </EnergyStoreProvider>
    </ResetProvider>
  )
}
