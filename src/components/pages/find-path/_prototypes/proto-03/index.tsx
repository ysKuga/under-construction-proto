'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  EnergyStoreProvider,
  useEnergyEventDispatcher,
  useEnergyStore,
  useRegisterEnergyOut,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  BoxBot01,
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07 } from '@/prototypes/stage/stage-07'
import { CellTitleProvider } from '@/prototypes/stage/stage-07/_contexts/cell-title'
import { Stage07EventProvider } from '@/prototypes/stage/stage-07/_events'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  ActorsStoreProvider,
  useActorsStore,
} from '@/prototypes/stage/stage-07/_stores/actors'

import { EnergyDebugPanel } from '../_components/energy-debug-panel'

import {
  EXECUTE_BUBBLE_OFFSET,
  ExecuteBubble,
  ExecuteBubbleHandle,
} from './_components/execute-bubble'
import {
  WAYPOINT_BUBBLE_OFFSET,
  WaypointBubble,
  WaypointBubbleHandle,
} from './_components/waypoint-bubble'
import { WaypointSelectingIndicator } from './_components/waypoint-selecting-indicator'
import {
  Stage07HandleProvider,
  useStage07HandleRef,
} from './_contexts/stage07-handle'
import {
  useVisibilityRegistry,
  VisibilityRegistryProvider,
} from './_contexts/visibility-registry'
import { FindPathEventProvider, useFindPathEventDispatcher } from './_events'
import { useAdvanceFollowPathOnCellReach } from './_hooks/use-advance-follow-path-on-cell-reach'
import { useEnergyOutAfterStop } from './_hooks/use-energy-out-after-stop'
import { usePreviewPath } from './_hooks/use-preview-path'
import { GoalMarkerLayer } from './_layers/goal-marker-layer'
import { ItemLayer } from './_layers/item-layer'
import { MoveTargetLayer } from './_layers/move-target-layer'
import { ObjectiveMarkerLayer } from './_layers/objective-marker-layer'
import { ObstacleLayer } from './_layers/obstacle-layer'
import { OneWayLayer } from './_layers/one-way-layer'
import { PathPreviewLayer } from './_layers/path-preview-layer'
import { WaypointSelectLayer } from './_layers/waypoint-select-layer'
import { canEnterForPath } from './_lib/can-enter-for-path'
import { describeCellContent } from './_lib/describe-cell-content'
import { findHexPathViaWaypoints } from './_lib/find-hex-path-via-waypoints'
import { getCellContents } from './_lib/get-cell-contents'
import { isSameCell } from './_lib/is-same-cell'
import { isObstacleCell } from './_lib/obstacle'
import { isBlockedByOneWay } from './_lib/one-way'
import {
  DisplaySettingsStoreProvider,
  useDisplaySettingsStore,
} from './_stores/display-settings'
import { MoveTargetDisplayMode } from './_stores/display-settings/types'
import { FogStoreProvider, useFogStore, useFogStoreApi } from './_stores/fog'
import { FogMode } from './_stores/fog/types'
import {
  FollowPathStoreProvider,
  useFollowPathStore,
  useFollowPathStoreApi,
} from './_stores/follow-path'
import { GoalStoreProvider, useGoalStore } from './_stores/goal'
import { ItemStoreProvider, useItemStoreApi } from './_stores/items'
import { ItemInstance } from './_stores/items/types'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from './_stores/waypoint-flow'
import {
  GOAL_POSITION,
  GRID,
  HEX_SIZE,
  RECOVERY_ITEM_CELLS,
  RECOVERY_SPOT_CELLS,
  START_POSITION,
} from './constants'

/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56
/** ステージ横に並べる独立 bot の一辺 px（向きを視認しやすいよう大きめ、issue #248） */
const STANDALONE_BOT_SIZE = 160

/** 「初期表示」select の選択肢 */
const FOG_MODE_OPTIONS: readonly { label: string; value: FogMode }[] = [
  { label: 'すべて表示', value: 'all-visible' },
  { label: 'すべて非表示', value: 'all-hidden' },
  { label: '部分的に非表示', value: 'partial' },
]

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

/**
 * 進入拒否条件を1件表す
 *
 * - `perceived`: 認識として不可（未到達・EN 切れ等、事前に把握できるため
 *   移動可能マス表示等のガイドにも反映する）
 * - `resultOnly`: 結果として不可（認識外の障害物・他アクターとのコンフリクト等、
 *   実行してみないと分からない。現時点では実例なし）
 */
type EnterGuard = {
  /** 対象セルへ進入可能か */
  check: (cell: HexCell) => boolean
  /** 判定の種類 */
  kind: 'perceived' | 'resultOnly'
}

type FindPathProto03Props = {
  /** 霧の適用範囲（初期表示）の初期値（既定 `all-hidden`） */
  initialFogMode?: FogMode
}

/**
 * FindPathProto03 —find-path ページ試作（hex グリッド版）
 *
 * - proto-02（矩形グリッド・隣接クリック逐次移動）を hex グリッドへ移し替えた
 *   試作。移動方式自体は `Stage07` の `useHexMove` に内蔵済み（issue #162）のため、
 *   ここでは `Stage07` のマウントとゴール到達判定のみを担う
 * - 非隣接セルクリック時は `onNonAdjacentClick` 経由で BFS 経路探索（`stage-07/_lib/hex-path`）
 *   を行い、`PathPreviewLayer` へ結果を表示する。到達不能なら `useNotifications` で
 *   通知する（issue #137 backlog）
 * - 中継点の設定（issue #137 backlog）: 経路が求まると bot 頭上に `WaypointBubble`
 *   （思考吹き出し）を表示し（`waypointFlowState !== 'idle'`、クリックで移行する
 *   選択モード中も表示を継続）、クリックで中継点選択モード（`'selecting'`）へ
 *   移行する。`WaypointBubble` は自身では
 *   座標計算を持たないため、`useActorsStore` の `overlayContainers` が公開する、
 *   player bot 用のコンテナ DOM（`playerOverlayContainer`、floor の 3D 空間外で
 *   bot の画面上の位置へ追従する）へ `createPortal` で注入する。位置は
 *   `WAYPOINT_BUBBLE_POSITION_CLASS_NAME`（bot 頭上の決め打ちオフセット）を渡す。`WaypointBubble` は現状、表示位置確認のための
 *   暫定実装（border 付き button）。`selectable` prop（枠線の実線/点線切替）は
 *   store で中継点選択モードを管理する想定の先行実装で、ここでは固定値 `false`
 *   を渡す（store 接続は次段階）。コンテナが floor の 3D 空間外にあるため、
 *   `GeoLayer` セルと重なってもクリックを奪われない。選択モード中は
 *   `Stage07` を `interactive={false}` にし、
 *   `WaypointSelectLayer` がセルクリックを拾って中継点を設置/除去する
 *   （設置済みセルへ 📍 を表示）。通常モードのクリック（`useHexMove` 経由）とは
 *   完全に別イベントとして分離する設計方針。`WaypointSelectingIndicator`
 *   （選択中インジケータ + 「完了」ボタン）で選択モードを終了し通常状態へ戻る。
 *   `WaypointBubble`/`WaypointSelectLayer`/`WaypointSelectingIndicator` は
 *   いずれも表示制御（`useCssToggle`）込みで自己完結したコンポーネントへ切り出し
 *   済み、親からは `visible` prop のみで駆動する（このコンポーネントは
 *   `waypointFlowState`（`_stores/waypoint-flow`）を各コンポーネントへ分配するだけでよい）。
 *   設置した中継点は最近傍順に経由する経路として `PathPreviewLayer` へ反映する
 *   （`findHexPathViaWaypoints`、issue #226）。bot を挟んで反対側の
 *   `ExecuteBubble`（「実行」吹き出し）で経路に沿って自動移動する（`Stage07Handle.followPath`）。EN 不足で進入できなくなったら
 *   その場で停止し、トーストで警告する
 * - `VisibilityRegistryProvider` は未到達マスを非表示にするための Provider（proto-02
 *   の hex 版）。霧の状態・可視判定は `FogStoreProvider`（`_stores/fog`）が持ち、
 *   registry は DOM の登録・反映のみを担う。可視判定は霧セルについて「視界（現在地
 *   基準の6近傍）」または「到達済み表示ONかつ到達済みセル」（`setShowVisited` で
 *   切替可能、既定 ON）。`Stage07`（hex タイルの表示/非表示）・`GoalMarkerLayer`
 *   （旗の表示/非表示）から読めるよう `Stage07` の外側に置く
 * - 霧の適用範囲（初期表示）は「初期表示」select でプレイ中に切替可能。初期値は
 *   `initialFogMode`（既定 `all-hidden`）。`partial` の霧セルは `PARTIAL_FOG_CELLS`
 * - 確認ダイアログは対象外（別途検討）
 * - 歩行モーション（`Stage07` の `enableWalking`）はチェックボックスで切替可能（既定 ON）。
 *   到着時の `walkingReset`（issue #162 の腕脚位置リセット action）により、
 *   1 マスごとの隣接クリック移動でも到着後に行進が続く不自然さが解消したため既定有効化。
 *   無効化との比較用にチェックボックスは残す
 * - `ActorsStoreProvider`（hex 版、zustand store）は actorId ごとの現在セルを
 *   保持する Provider。`Stage07` の外側に置く（issue #181 PR-A。tick 駆動実行の
 *   追加に備え、外部からクリックを介さず actor を動かせるようにするため）。
 *   player・mob を区別せず一元管理する（issue #215）
 * - EN（エネルギー、issue #181）: 1 マス移動するごとに 1 消費、アイテム回復量ぶん
 *   回復する。予定経路・tick 駆動の「実行」は proto-01 と異なり導入しない（1 マス
 *   ごとの隣接クリック移動のまま）ため、`canEnterCell` へ残量判定を加え、移動成立時
 *   に `Energy-consume`/`Energy-recover` イベントを dispatch する（実消費・実回復・
 *   0 以下/より大きくなった判定・`Energy-depleted`/`Energy-recovered` 発行は energy
 *   store 側の consume/recover-listener が担う。proto-01 の `use-find-path-tick`
 *   と同じ経路）
 * - EN 切れ演出（予防姿勢、issue #181、proto-01 の `energyOutAction` 相当）:
 *   `Stage07` が `actorEventTarget` prop 経由で bot と共有する EventTarget を公開
 *   するようにし（stage-06 と同じ方式）、page 側で `useBoxBotActionDispatcher`
 *   から `energyOut` dispatcher を得る。`useRegisterEnergyOut`（`_stores/energy`、
 *   proto-01 と共通化）へ登録するだけでよく、トグル発火・復帰は
 *   `useOutOfEnergyEventListener`（scope 全体で 1 回だけ）が
 *   `Energy-depleted`/`Energy-recovered` 購読で一元的に担う
 * - 障害物の説明表示（issue #137）: `ObstacleLayer` は `pointerEvents: none` の
 *   非対話オーバーレイで hover を受け取れないため、実際にマウスオーバーを受ける
 *   `GeoLayer` のセル本体へ `title` を持たせる。stage-07 は find-path 固有の概念を
 *   持たないため、`CellTitleProvider`（`stage-07/_contexts/cell-title`）で
 *   `getCellTitle` の中身（障害物・アイテムの説明、`getCellContents`/
 *   `describeCellContent`）を注入する（PR #196 レビュー対応）
 * - 回復アイテム/回復スポット（issue #181、proto-01 から移植）: proto-01 と同じ
 *   `ItemStore` を axial 座標へ移植した固有実装（`_stores/items`）。proto-03 は
 *   予定経路・tick 駆動を持たないため即時使用のまま（携行可能化は対象外、別途検討）。
 *   `handleCellChange` で移動先セルのアイテムを消費し即時回復する
 * - リセット（境界値テスト用、issue #181）: `resetKey` を `EnergyStoreProvider`
 *   以下（position 含む）へ `key` として渡し、値更新で Provider 群ごと丸ごと
 *   再マウントする（proto-01 と同じ方式）
 * - 経路の提示・実行（issue #226）: UI は `FindPathEventProvider`（`_events`）の
 *   EventTarget へ担当範囲の情報を発行し、EN 等のゲーム要素による実行可否は
 *   listener 側で判定する（docs/concept/implementation/ui-jurisdiction）
 */
const FindPathProto03 = (props: FindPathProto03Props) => {
  const { initialFogMode = 'all-hidden' } = props

  const [resetKey, setResetKey] = useState(0)

  return (
    <EnergyStoreProvider key={resetKey}>
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
                            <FindPathProto03Content
                              onReset={() => setResetKey((key) => key + 1)}
                            />
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
  )
}

type FindPathProto03ContentProps = {
  /** 「リセット」。全 store（position/items 等）を初期状態に戻す */
  onReset: () => void
}

/** `useVisibilityRegistry` を Provider の内側で呼び、UI へ配布する */
const FindPathProto03Content = (props: FindPathProto03ContentProps) => {
  const { onReset } = props
  /** player の現在セル（`Stage07` が移動成立時に actors store を更新する） */
  const currentCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  /** 移動可能マスの表示演出（display-settings store） */
  const displayMode = useDisplaySettingsStore((state) => state.displayMode)
  /** 移動可能マスの表示演出を切り替える（display-settings store） */
  const setDisplayMode = useDisplaySettingsStore(
    (state) => state.setDisplayMode,
  )
  /** 歩行モーションの有無（display-settings store） */
  const enableWalking = useDisplaySettingsStore((state) => state.enableWalking)
  /** 歩行モーションの有無を切り替える（display-settings store） */
  const setEnableWalking = useDisplaySettingsStore(
    (state) => state.setEnableWalking,
  )
  /** ゴールへ到達済みか（goal store） */
  const goalReached = useGoalStore((state) => state.reached)
  /** ゴール到達を記録する（goal store） */
  const reachGoal = useGoalStore((state) => state.reach)
  /** 中継点フローの状態（waypoint-flow store） */
  const waypointFlowState = useWaypointFlowStore((state) => state.flowState)
  /** 非隣接クリックで選んだ経路の目標セル（waypoint-flow store、経路プレビュー中のみ） */
  const objectiveCell = useWaypointFlowStore((state) => state.objectiveCell)
  /** 設置済みの中継点（waypoint-flow store） */
  const waypoints = useWaypointFlowStore((state) => state.waypoints)
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  /** `Stage07` の imperative API。経路に沿った自動移動を命令する */
  const stage07HandleRef = useStage07HandleRef()
  const previewPath = usePreviewPath()
  /**
   * `WaypointBubble` の imperative API。`selectable`(思考吹き出し⇔発言吹き出し
   * の切替)を props でなくこの ref 経由で命令する（`WaypointBubbleHandle`
   * 内コメント参照）
   */
  const waypointBubbleRef = useRef<WaypointBubbleHandle>(null)
  /** `ExecuteBubble` の imperative API。半透明化を ref 経由で命令する */
  const executeBubbleRef = useRef<ExecuteBubbleHandle>(null)
  /**
   * `useActorsStore` の `overlayContainers` が公開する、player bot 用の
   * コンテナ DOM。`WaypointBubble` をここへ `createPortal` で注入する
   * （issue #137）。`Stage07` の `ActorOverlayLayer` が floor の 3D 空間外に
   * 用意し、bot の画面上の位置へ追従させる（props drilling でなく actor に
   * 紐づく store 経由）
   */
  const playerOverlayContainer = useActorsStore(
    (state) => state.overlayContainers[PLAYER_ACTOR_ID],
  )
  const { registerVisibilityNode } = useVisibilityRegistry()
  /** 現在地を更新し、視界を到達済みとして記録する（fog store） */
  const markVisited = useFogStore((state) => state.markVisited)
  /** 到達済み表示の有無を切り替える（fog store） */
  const setShowVisited = useFogStore((state) => state.setShowVisited)
  /** 霧の適用範囲を切り替える（fog store） */
  const setFogMode = useFogStore((state) => state.setMode)
  const fogStoreApi = useFogStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
  const itemStoreApi = useItemStoreApi()
  const addNotification = useNotifications((state) => state.addNotification)
  const findPathEventDispatcher = useFindPathEventDispatcher()
  /**
   * 自動移動中の経路（follow-path store）
   *
   * - 変化するのは自動移動の開始・終了時のみ。1 マスごとの進行（`followedCount`）は
   *   `PathPreviewLayer` が直接購読するため、ここでは購読しない
   */
  const followingPath = useFollowPathStore((state) => state.followingPath)
  /** 経路に沿った自動移動中か（`Stage07` を非対話化する） */
  const isAutoMoving = useFollowPathStore((state) => state.isFollowing())
  const followPathStoreApi = useFollowPathStoreApi()

  const [actorEventTarget] = useState<EventTarget>(() => new EventTarget())
  const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
    energyOutAction,
  ])
  // EN 切れ演出(予防姿勢)の発火・復帰は `useOutOfEnergyEventListener`（`_stores/energy`、
  // scope 全体で 1 回だけマウント。issue-181-en）が Energy-depleted/Energy-recovered
  // 購読で一元的に担う。ここでは自分の energyOut dispatcher を actorId キーで
  // 登録するだけでよい。演出は歩いている途中で始まらないよう、停止まで待たせる
  // （`useEnergyOutAfterStop`）
  const energyOutAfterStop = useEnergyOutAfterStop(PLAYER_ACTOR_ID, energyOut)

  // 経路プレビューの点は、bot がマスの中心に着いた時点で消す（進行の記録を到達時に行う）
  useAdvanceFollowPathOnCellReach(PLAYER_ACTOR_ID)
  useRegisterEnergyOut({
    actorId: PLAYER_ACTOR_ID,
    energyOut: energyOutAfterStop,
  })

  /** `GoalMarkerLayer`/`ObstacleLayer`/`OneWayLayer`/`ItemLayer` の DOM をvisibility registry へ登録する（`kind: 'marker'` 固定） */
  const registerMarkerVisibilityNode = useCallback(
    (cell: HexCell, el: HTMLElement | null) =>
      registerVisibilityNode(cell, 'marker', el),
    [registerVisibilityNode],
  )

  /** `Stage07`（hex タイル）の DOM を visibility registry へ登録する（`kind: 'floor'` 固定） */
  const registerFloorVisibilityNode = useCallback(
    (cell: HexCell, el: HTMLElement | null) =>
      registerVisibilityNode(cell, 'floor', el),
    [registerVisibilityNode],
  )

  /**
   * `WaypointSelectLayer` の DOM を visibility registry へ登録する
   * （`kind: 'waypoint'` 固定）
   *
   * - 全セルに存在するため `marker` と同一セルで衝突しうる（`marker` は
   *   `Map<NodeKind, HTMLElement>` で kind ごとに 1 要素しか持てず、GoalMarkerLayer
   *   等と同じセルに登録すると後勝ちで上書きされてしまう）ので独立した kind にする
   * - 視界外セルへも中継点を設置できてしまう見た目の不整合（実機検証で発見）を防ぐ
   */
  const registerWaypointVisibilityNode = useCallback(
    (cell: HexCell, el: HTMLElement | null) =>
      registerVisibilityNode(cell, 'waypoint', el),
    [registerVisibilityNode],
  )

  /**
   * 非隣接セルをクリックした時。クリックしたセルを目標とし、BFS で経路を求め
   * `PathPreviewLayer` へ表示する（自動移動は吹き出しの「実行」で開始する、issue #226）
   *
   * - `Stage07` は find-path 固有の概念（目標）を持たないため、prop 名は
   *   `onNonAdjacentClick`（クリックの種類）のまま受ける
   * - 提示前に `FindPath-propose-path` を発行し、listener に拒否されたら（EN 切れ等）
   *   何もしない。拒否の理由（EN 等）は UI では扱わない（ui-jurisdiction）
   */
  const handleNonAdjacentClick = useCallback(
    async (cell: HexCell) => {
      if (!(await findPathEventDispatcher['FindPath-propose-path']({ cell }))) {
        return
      }

      const path = findHexPathViaWaypoints(
        currentCell,
        waypoints,
        cell,
        GRID.cols,
        GRID.rows,
        canEnterForPath,
      )

      if (!path) {
        addNotification({
          options: { autoDismiss: true },
          title: `(${cell.q}, ${cell.r}) へは到達できません`,
          type: 'info',
        })
        waypointFlowStoreApi.getState().unpropose()

        return
      }

      waypointFlowStoreApi.getState().propose(cell)
    },
    [
      addNotification,
      currentCell,
      findPathEventDispatcher,
      waypointFlowStoreApi,
      waypoints,
    ],
  )

  /**
   * 中継点の吹き出しクリック時。中継点選択モードへ移行する
   *
   * - 選択中なら解除し、経路提示中(`proposing`)へ戻す。吹き出しは表示したままにし、
   *   「実行」や再度の選択へつなげる
   */
  const handleWaypointBubbleClick = useCallback(() => {
    const { flowState, setFlowState } = waypointFlowStoreApi.getState()

    setFlowState(flowState === 'selecting' ? 'proposing' : 'selecting')
  }, [waypointFlowStoreApi])

  // waypointFlowState の変化を吹き出しの selectable・半透明化(imperative) へ同期する。
  // 中継点選択中は吹き出しが背後の経路を隠さないよう半透明にする（issue #226）
  useEffect(() => {
    const isSelecting = waypointFlowState === 'selecting'

    waypointBubbleRef.current?.setSelectable(isSelecting)
    waypointBubbleRef.current?.setTranslucent(isSelecting)
    executeBubbleRef.current?.setTranslucent(isSelecting)
  }, [waypointFlowState])

  /**
   * 「実行」吹き出しクリック時。表示中の経路に沿って自動移動を開始する
   *
   * - 中継点フローは終了する（`objectiveCell`/`waypoints` は最初の 1 マス移動時に
   *   `handleCellChange` がクリアする）
   * - 経路は follow-path store へ固定し、自動移動中はその残りをプレビューする
   * - 自動移動中は `Stage07` を非対話化し、クリックによる割込みを防ぐ
   * - 開始前に `FindPath-execute-path` を発行し、listener に拒否されたら（EN 切れ等）
   *   開始しない。経路提示後に EN が切れた場合の対策
   */
  const handleExecuteClick = useCallback(async () => {
    if (previewPath.length === 0) return
    if (
      !(await findPathEventDispatcher['FindPath-execute-path']({
        path: previewPath,
      }))
    ) {
      return
    }

    waypointFlowStoreApi.getState().setFlowState('idle')
    followPathStoreApi.getState().start(previewPath)
    stage07HandleRef.current?.followPath(previewPath)
  }, [
    findPathEventDispatcher,
    followPathStoreApi,
    previewPath,
    stage07HandleRef,
    waypointFlowStoreApi,
  ])

  /**
   * 自動移動の終了時。途中停止（EN 不足）ならトーストで警告する
   *
   * - 目標・中継点をクリアし経路プレビューを消す。通常は最初の 1 マス移動時に
   *   `handleCellChange` がクリアするが、1 マスも移動せず停止した場合に残るため
   */
  const handleFollowPathEnd = useCallback(
    (blockedCell?: HexCell) => {
      followPathStoreApi.getState().end()
      waypointFlowStoreApi.getState().clear()

      if (!blockedCell) return

      addNotification({
        options: { autoDismiss: true },
        title: `EN 不足のため (${blockedCell.q}, ${blockedCell.r}) の手前で停止しました`,
        type: 'warning',
      })
    },
    [addNotification, followPathStoreApi, waypointFlowStoreApi],
  )

  /**
   * 「完了」クリック時。中継点選択モードを終了し通常状態へ戻る
   *
   * - 設置済みの `waypoints` はクリアしない（「実行」までプレビュー経路に使う）
   */
  const handleWaypointDoneClick = useCallback(() => {
    waypointFlowStoreApi.getState().setFlowState('idle')
  }, [waypointFlowStoreApi])

  /**
   * 中継点選択モード中のセルクリック時。中継点を設置/除去する
   *
   * - 経由順は設置順でなく最近傍順（`findHexPathViaWaypoints` 内で決める）
   * - 設置により経路が到達不能になる場合（障害物セル等）は通知して設置しない
   */
  const handleWaypointCellClick = useCallback(
    (cell: HexCell) => {
      const index = waypoints.findIndex((waypoint) =>
        isSameCell(waypoint, cell),
      )

      if (index !== -1) {
        waypointFlowStoreApi
          .getState()
          .setWaypoints(waypoints.filter((_, i) => i !== index))

        return
      }

      const next = [...waypoints, cell]
      const path =
        objectiveCell &&
        findHexPathViaWaypoints(
          currentCell,
          next,
          objectiveCell,
          GRID.cols,
          GRID.rows,
          canEnterForPath,
        )

      if (!path) {
        addNotification({
          options: { autoDismiss: true },
          title: `(${cell.q}, ${cell.r}) を経由できません`,
          type: 'info',
        })

        return
      }

      waypointFlowStoreApi.getState().setWaypoints(next)
    },
    [
      addNotification,
      currentCell,
      objectiveCell,
      waypointFlowStoreApi,
      waypoints,
    ],
  )

  const handleCellChange = (cell: HexCell) => {
    waypointFlowStoreApi.getState().clear()
    markVisited(cell)

    const item = itemStoreApi.getState().getItemAtCell(cell)
    const consumed = item && itemStoreApi.getState().consumeItem(item.id)

    // 消費・回復とも energy store 側の consume/recover-listener が実処理・閾値判定・
    // Energy-depleted/Energy-recovered 発行を担う（proto-01 の `use-find-path-tick`
    // と同じ経路）。EN 切れ演出の発火・復帰は `useOutOfEnergyEventListener` 側が
    // 担うため、ここでは dispatch するだけでよい
    if (consumed) {
      void energyDispatch['Energy-recover']({
        actorId: PLAYER_ACTOR_ID,
        amount: consumed.amount,
      })
    }

    void energyDispatch['Energy-consume']({
      actorId: PLAYER_ACTOR_ID,
      amount: 1,
    })

    if (isSameCell(cell, GOAL_POSITION)) {
      reachGoal()
    }
  }

  /**
   * 進入拒否条件一覧（`EnterGuard`。EN 残量チェックは含まない）
   *
   * - EN 残量チェックは `MoveTargetLayer` 自身が EN store を直接購読して適用する
   *   ため、ここでは対象外（issue-181-en backlog: `EnergyDebugPanel` 操作で
   *   `Stage07` 配下ツリー全体が再レンダリングされる問題の解消）
   */
  const enterGuards: EnterGuard[] = useMemo(
    () => [
      { check: (cell) => !isObstacleCell(cell), kind: 'perceived' },
      {
        check: (cell) => !isBlockedByOneWay(currentCell, cell),
        kind: 'perceived',
      },
    ],
    [currentCell],
  )

  /**
   * `MoveTargetLayer` へ渡す進入可否（`perceived` ガードのみ、EN 残量チェックは除く）
   *
   * - EN 残量チェックを含めると EN 変化のたびこの関数が新しい参照になり、
   *   `MoveTargetLayer` の `React.memo` が効かなくなる
   */
  const canEnterCellPerceived = useCallback(
    (cell: HexCell) =>
      enterGuards
        .filter((guard) => guard.kind === 'perceived')
        .every((guard) => guard.check(cell)),
    [enterGuards],
  )

  /** EN 残量。`energyInfo.current` を直接 `useCallback` の依存配列に入れると意図せず不安定化するため、プリミティブ値へ切り出す */
  const energyCurrent = energyInfo.current

  /** `Stage07` へ渡す進入可否（実際の移動判定・選択可能表示用。EN 残量チェック込みの全ガード） */
  const canEnterCell = useCallback(
    (cell: HexCell) => canEnterCellPerceived(cell) && energyCurrent > 0,
    [canEnterCellPerceived, energyCurrent],
  )

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Find Path (proto-03 / hex)
      </h1>
      <div className="flex items-center gap-8">
        {/* Stage07 は操作 slider 群が横に広がるため、min-content で床(scene)の幅へ合わせる */}
        <div className="w-min">
          <CellTitleProvider
            getCellTitle={(cell) => {
              const contents = getCellContents(cell, itemStoreApi.getState())

              return contents[0] && describeCellContent(contents[0])
            }}
          >
            <Stage07
              actorEventTarget={actorEventTarget}
              botSize={BOT_SIZE}
              canEnterCell={canEnterCell}
              cols={GRID.cols}
              enableWalking={enableWalking}
              hexSize={HEX_SIZE}
              initialTiltDeg={55}
              interactive={waypointFlowState !== 'selecting' && !isAutoMoving}
              onCellChange={handleCellChange}
              onFollowPathEnd={handleFollowPathEnd}
              onNonAdjacentClick={handleNonAdjacentClick}
              ref={stage07HandleRef}
              registerCellVisibilityNode={registerFloorVisibilityNode}
              rows={GRID.rows}
            >
              <GoalMarkerLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                registerVisibilityNode={registerMarkerVisibilityNode}
                rows={GRID.rows}
              />
              <ObstacleLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                registerVisibilityNode={registerMarkerVisibilityNode}
                rows={GRID.rows}
              />
              <OneWayLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                registerVisibilityNode={registerMarkerVisibilityNode}
                rows={GRID.rows}
              />
              <ItemLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                registerVisibilityNode={registerMarkerVisibilityNode}
                rows={GRID.rows}
              />
              <MoveTargetLayer
                canEnterCell={canEnterCellPerceived}
                cols={GRID.cols}
                currentCell={currentCell}
                hexSize={HEX_SIZE}
                mode={displayMode}
                rows={GRID.rows}
              />
              <PathPreviewLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                path={previewPath}
                rows={GRID.rows}
              />
              <ObjectiveMarkerLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                objectiveCell={
                  isAutoMoving ? followingPath.at(-1) : objectiveCell
                }
                rows={GRID.rows}
              />
              <WaypointSelectLayer
                cols={GRID.cols}
                hexSize={HEX_SIZE}
                onCellClick={handleWaypointCellClick}
                registerVisibilityNode={registerWaypointVisibilityNode}
                rows={GRID.rows}
                visible={waypointFlowState === 'selecting'}
                waypoints={waypoints}
              />
            </Stage07>
          </CellTitleProvider>
        </div>
        {/* ステージ上の bot とは別に独立表示する bot（向き同期は後続、issue #248） */}
        <BoxBot01
          actions={[]}
          interactive={false}
          orbit={false}
          style={{ height: STANDALONE_BOT_SIZE, width: STANDALONE_BOT_SIZE }}
        />
      </div>
      {playerOverlayContainer &&
        createPortal(
          <WaypointBubble
            offset={WAYPOINT_BUBBLE_OFFSET}
            onClick={handleWaypointBubbleClick}
            ref={waypointBubbleRef}
            visible={waypointFlowState !== 'idle'}
          />,
          playerOverlayContainer,
        )}
      {playerOverlayContainer &&
        createPortal(
          <ExecuteBubble
            offset={EXECUTE_BUBBLE_OFFSET}
            onClick={handleExecuteClick}
            ref={executeBubbleRef}
            visible={waypointFlowState !== 'idle'}
          />,
          playerOverlayContainer,
        )}
      <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
        <label>
          初期表示{' '}
          <select
            defaultValue={fogStoreApi.getState().mode}
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
        <span>
          EN: {energyInfo.current}/{energyInfo.max}
        </span>
        <button onClick={onReset} type="button">
          リセット
        </button>
        <span hidden={!goalReached}>🎉 ゴール到達</span>
        <WaypointSelectingIndicator
          onDoneClick={handleWaypointDoneClick}
          visible={waypointFlowState === 'selecting'}
        />
        <span hidden={waypoints.length === 0}>中継点: {waypoints.length}</span>
      </div>
      <EnergyDebugPanel />
    </div>
  )
}

export default FindPathProto03
