'use client'

import { PropsWithChildren } from 'react'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07EventProvider } from '@/prototypes/stage/stage-07/_events'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import { PlayerActorEventTargetProvider } from './_contexts/player-actor-event-target'
import { ResetProvider } from './_contexts/reset'
import { useStageLayout } from './_contexts/stage-layout'
import { StageSeedProvider } from './_contexts/stage-seed'
import { Stage07HandleProvider } from './_contexts/stage07-handle'
import { VisibilityRegistryProvider } from './_contexts/visibility-registry'
import { FindPathEventProvider } from './_events'
import { createInitialItems } from './_lib/create-initial-items'
import { CarriedItemStoreProvider } from './_stores/carried-items'
import { DisplaySettingsStoreProvider } from './_stores/display-settings'
import { EnergySettingsStoreProvider } from './_stores/energy-settings'
import { FogStoreProvider } from './_stores/fog'
import { FollowPathStoreProvider } from './_stores/follow-path'
import { GoalStoreProvider } from './_stores/goal'
import { ItemStoreProvider } from './_stores/items'
import { PlayerActivityStoreProvider } from './_stores/player-activity'
import { WaypointFlowStoreProvider } from './_stores/waypoint-flow'
import { FindPathProto03Props } from './index.types'

type FindPathProto03ProvidersProps = PropsWithChildren<FindPathProto03Props>

/**
 * proto-03 のページ全体で共有する Provider（store・event・context）をまとめてネストする
 *
 * - 並び順の制約（それ以外の Provider 間に依存はない）
 *   - `FindPathEventProvider` は `EnergyStoreProvider` の内側に置く\
 *     （EN 判定の listener が energy store を参照するため）
 *   - `FindPathEventProvider` は `CarriedItemStoreProvider` の内側に置く\
 *     （携行アイテム使用の listener が携行 store を参照するため）
 *   - `FindPathEventProvider` は `PlayerActivityStoreProvider` の内側に置く\
 *     （EN スポットで補給中の操作を拒否する listener が行為 store を参照するため）
 *   - `VisibilityRegistryProvider` は `FogStoreProvider` の内側に置く\
 *     （fog store を購読するため）
 *   - `FogStoreProvider` は `StageLayoutProvider` の内側に置く\
 *     （霧セル・視界の初期中心を盤面配置から決めるため）
 * - 盤面生成（issue #315）: 最外の `StageSeedProvider`（`_contexts/stage-seed`）が
 *   seed から盤面配置を生成して `StageLayoutProvider` で配り、seed 変更時は配下を丸ごと再マウントする
 * - リセット（境界値テスト用、issue #181）: `StageSeedProvider` 直下の `ResetProvider`（`_contexts/reset`）が
 *   配下の Provider 群（position 含む）へ `key` を付け、`reset` で丸ごと再マウントする
 *   （proto-01 と同じ方式）。表示設定・霧のモード含め全 store が初期状態へ戻る。seed は保持されるため盤面は同じ配置
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
  const { children, initialFogMode, initialSeed } = props

  return (
    <StageSeedProvider initialSeed={initialSeed}>
      <ResetProvider>
        <StageProviders initialFogMode={initialFogMode}>
          {children}
        </StageProviders>
      </ResetProvider>
    </StageSeedProvider>
  )
}

/**
 * 盤面配置に依存する Provider 群（store・event・context）
 *
 * - アイテム・開始位置の初期値を `useStageLayout` の盤面配置から組み立てる
 */
const StageProviders = (props: FindPathProto03ProvidersProps) => {
  const { children, initialFogMode = 'all-hidden' } = props
  const stageLayout = useStageLayout()

  return (
    <EnergyStoreProvider>
      <CarriedItemStoreProvider>
        <PlayerActivityStoreProvider>
          <FindPathEventProvider>
            <ItemStoreProvider initialItems={createInitialItems(stageLayout)}>
              <ActorsStoreProvider
                initialActors={{
                  [PLAYER_ACTOR_ID]: stageLayout.start,
                }}
              >
                <Stage07EventProvider>
                  <FogStoreProvider initialMode={initialFogMode}>
                    <VisibilityRegistryProvider>
                      <FollowPathStoreProvider>
                        <WaypointFlowStoreProvider>
                          <DisplaySettingsStoreProvider>
                            <EnergySettingsStoreProvider>
                              <GoalStoreProvider>
                                <Stage07HandleProvider>
                                  <PlayerActorEventTargetProvider>
                                    {children}
                                  </PlayerActorEventTargetProvider>
                                </Stage07HandleProvider>
                              </GoalStoreProvider>
                            </EnergySettingsStoreProvider>
                          </DisplaySettingsStoreProvider>
                        </WaypointFlowStoreProvider>
                      </FollowPathStoreProvider>
                    </VisibilityRegistryProvider>
                  </FogStoreProvider>
                </Stage07EventProvider>
              </ActorsStoreProvider>
            </ItemStoreProvider>
          </FindPathEventProvider>
        </PlayerActivityStoreProvider>
      </CarriedItemStoreProvider>
    </EnergyStoreProvider>
  )
}
