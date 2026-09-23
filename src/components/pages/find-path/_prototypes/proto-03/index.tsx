'use client'

import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  EnergyStoreProvider,
  useEnergyEventDispatcher,
  useEnergyStore,
  useRegisterEnergyOut,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { useNotifications } from '@/components/ui/notifications'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07 } from '@/prototypes/stage/stage-07'
import { CellTitleProvider } from '@/prototypes/stage/stage-07/_contexts/cell-title'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { findHexPath } from '@/prototypes/stage/stage-07/_lib/hex-path'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import { EnergyDebugPanel } from '../_components/energy-debug-panel'

import { GoalMarkerLayer } from './_components/goal-marker-layer'
import { ItemLayer } from './_components/item-layer'
import {
  MoveTargetDisplayMode,
  MoveTargetLayer,
} from './_components/move-target-layer'
import { ObstacleLayer } from './_components/obstacle-layer'
import { OneWayLayer } from './_components/one-way-layer'
import { PathPreviewLayer } from './_components/path-preview-layer'
import {
  WAYPOINT_BUBBLE_POSITION_CLASS_NAME,
  WaypointBubble,
} from './_components/waypoint-bubble'
import { WaypointSelectLayer } from './_components/waypoint-select-layer'
import { WaypointSelectingIndicator } from './_components/waypoint-selecting-indicator'
import {
  useVisibilityRegistry,
  VisibilityRegistryProvider,
} from './_contexts/visibility-registry'
import { describeCellContent } from './_lib/describe-cell-content'
import { getCellContents } from './_lib/get-cell-contents'
import { isObstacleCell } from './_lib/obstacle'
import { isBlockedByOneWay } from './_lib/one-way'
import { ItemStoreProvider, useItemStoreApi } from './_stores/items'
import { ItemInstance } from './_stores/items/types'
import {
  GOAL_POSITION,
  RECOVERY_ITEM_CELLS,
  RECOVERY_SPOT_CELLS,
  START_POSITION,
} from './constants'

/** グリッド形状 */
const GRID = { cols: 5, rows: 5 } as const
/** 六角形の外接円半径 (px) */
const HEX_SIZE = 40
/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56

/** axial セルの一致判定 */
const isSameCell = (a: HexCell, b: HexCell) => a.q === b.q && a.r === b.r

/**
 * 経路探索(BFS)用の進入可否判定（EN 残量チェックは含まない、静的な障害物・
 * 一方通行のみ）
 *
 * - `enterGuards`（コンポーネント内、`currentCell` に固定された perceived ガード）
 *   とは別に用意する。一方通行判定(`isBlockedByOneWay`)は移動元セルに依存するため、
 *   探索中に動く `from` をそのまま受け取れる形にする必要がある
 * - EN 残量は探索実行の瞬間の値でしかなく、経路の各手で消費されていく動的資源
 *   のため経路の「形」自体には含めない（不足時の扱いは自動移動実装時に検討）
 */
const canEnterForPath = (from: HexCell, to: HexCell): boolean =>
  !isObstacleCell(to) && !isBlockedByOneWay(from, to)

/**
 * 中継点フローの状態（issue #137 backlog「中継点の設定」）
 *
 * - `idle`: 通常状態。セルクリックは `useHexMove` 経由の隣接移動/非隣接経路探索
 * - `proposing`: 非隣接クリックで経路が求まった直後。bot 頭上に `WaypointBubble`
 *   （思考吹き出し）を表示する
 * - `selecting`: `WaypointBubble` クリックで移行。`Stage07` を非対話化し
 *   `WaypointSelectLayer` がセルクリックを拾って中継点を設置/除去する
 */
type WaypointFlowState = 'idle' | 'proposing' | 'selecting'

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

/**
 * FindPathProto03 — find-path ページ試作（hex グリッド版）
 *
 * - proto-02（矩形グリッド・隣接クリック逐次移動）を hex グリッドへ移し替えた
 *   試作。移動方式自体は `Stage07` の `useHexMove` に内蔵済み（issue #162）のため、
 *   ここでは `Stage07` のマウントとゴール到達判定のみを担う
 * - 非隣接セルクリック時は `onNonAdjacentClick` 経由で BFS 経路探索（`stage-07/_lib/hex-path`）
 *   を行い、`PathPreviewLayer` へ結果を表示する。到達不能なら `useNotifications` で
 *   通知する（issue #137 backlog、自動移動の実行は次段階）
 * - 中継点の設定（issue #137 backlog）: 経路が求まると bot 頭上に `WaypointBubble`
 *   （思考吹き出し）を表示し（`waypointFlowState === 'proposing'`）、クリックで
 *   中継点選択モード（`'selecting'`）へ移行する。`WaypointBubble` は自身では
 *   座標計算を持たないため、`Stage07` の `registerPlayerOverlayContainer` が
 *   公開する、player bot の位置決め div 内のコンテナ DOM（`playerOverlayContainer`
 *   state）へ `createPortal` で注入する。これにより bot の現在地追従・floor の
 *   tilt 打ち消しを bot 要素側の transform にそのまま乗せられる（`WaypointBubble`
 *   内コメント参照）。位置は `WAYPOINT_BUBBLE_POSITION_CLASS_NAME`（bot 頭上の
 *   決め打ちオフセット）を渡す。`WaypointBubble` は現状、表示位置確認のための
 *   暫定実装（border 付き button）。`selectable` prop（枠線の実線/点線切替）は
 *   store で中継点選択モードを管理する想定の先行実装で、ここでは固定値 `false`
 *   を渡す（store 接続は次段階）。`rotateX` + `preserve-3d` 環境のブラウザ
 *   奥行きヒットテストに `GeoLayer` セルへクリックを奪われる問題への対処
 *   （`translateZ` 押し出し等）は見た目確定後に再検討する。選択モード中は
 *   `Stage07` を `interactive={false}` にし、
 *   `WaypointSelectLayer` がセルクリックを拾って中継点を設置/除去する
 *   （設置済みセルへ 📍 を表示）。通常モードのクリック（`useHexMove` 経由）とは
 *   完全に別イベントとして分離する設計方針。`WaypointSelectingIndicator`
 *   （選択中インジケータ + 「完了」ボタン）で選択モードを終了し通常状態へ戻る。
 *   `WaypointBubble`/`WaypointSelectLayer`/`WaypointSelectingIndicator` は
 *   いずれも表示制御（`useCssToggle`）込みで自己完結したコンポーネントへ切り出し
 *   済み、親からは `visible` prop のみで駆動する（このコンポーネントは
 *   `waypointFlowState` を保持し各コンポーネントへ分配するだけでよい）。
 *   経由順の最近傍接続・経路への統合は次段階
 * - `VisibilityRegistryProvider` は未到達マスを非表示にするための Provider（proto-02
 *   の hex 版）。可視判定は「視界（現在地基準の6近傍）」または「到達済み表示ONかつ
 *   到達済みセル」（`setShowVisited` で切替可能、既定 ON）。`Stage07`（hex タイルの
 *   表示/非表示）・`GoalMarkerLayer`（旗の表示/非表示）から読めるよう `Stage07`
 *   の外側に置く
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
 */
const FindPathProto03 = () => {
  const [resetKey, setResetKey] = useState(0)

  return (
    <EnergyStoreProvider key={resetKey}>
      <ItemStoreProvider initialItems={INITIAL_ITEMS}>
        <ActorsStoreProvider
          initialActors={{ [PLAYER_ACTOR_ID]: START_POSITION }}
        >
          <VisibilityRegistryProvider>
            <FindPathProto03Content
              onReset={() => setResetKey((key) => key + 1)}
            />
          </VisibilityRegistryProvider>
        </ActorsStoreProvider>
      </ItemStoreProvider>
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
  const [currentCell, setCurrentCell] = useState<HexCell>(START_POSITION)
  const [displayMode, setDisplayMode] =
    useState<MoveTargetDisplayMode>('scatter')
  const [enableWalking, setEnableWalking] = useState(true)
  const [goalReached, setGoalReached] = useState(false)
  const [previewPath, setPreviewPath] = useState<HexCell[]>([])
  const [waypointFlowState, setWaypointFlowState] =
    useState<WaypointFlowState>('idle')
  const [waypoints, setWaypoints] = useState<HexCell[]>([])
  /**
   * `Stage07` の `registerPlayerOverlayContainer` が公開する、player bot の
   * 位置決め div 内のコンテナ DOM。`WaypointBubble` をここへ `createPortal` で
   * 注入する（issue #137、bot 頭上への追従・tilt 打ち消しを bot 要素側の
   * transform に乗せるため）
   */
  const [playerOverlayContainer, setPlayerOverlayContainer] =
    useState<HTMLDivElement | null>(null)
  const { markVisited, registerVisibilityNode, setShowVisited } =
    useVisibilityRegistry()
  const energyDispatch = useEnergyEventDispatcher()
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
  const itemStoreApi = useItemStoreApi()
  const addNotification = useNotifications((state) => state.addNotification)

  const [actorEventTarget] = useState<EventTarget>(() => new EventTarget())
  const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
    energyOutAction,
  ])
  // EN 切れ演出(予防姿勢)の発火・復帰は `useOutOfEnergyEventListener`（`_stores/energy`、
  // scope 全体で 1 回だけマウント。issue-181-en）が Energy-depleted/Energy-recovered
  // 購読で一元的に担う。ここでは自分の energyOut dispatcher を actorId キーで
  // 登録するだけでよい
  useRegisterEnergyOut({ actorId: PLAYER_ACTOR_ID, energyOut })

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
   * 非隣接セルをクリックした時。BFS で経路を求め `PathPreviewLayer` へ表示する
   * （issue #137 backlog、自動移動の実行は次段階）
   */
  const handleNonAdjacentClick = useCallback(
    (cell: HexCell) => {
      const path = findHexPath(
        currentCell,
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
        setPreviewPath([])
        setWaypointFlowState('idle')

        return
      }

      setPreviewPath(path)
      setWaypointFlowState('proposing')
    },
    [addNotification, currentCell],
  )

  /** 思考吹き出しクリック時。中継点選択モードへ移行する */
  const handleWaypointBubbleClick = useCallback(() => {
    setWaypointFlowState('selecting')
  }, [])

  /**
   * 「完了」クリック時。中継点選択モードを終了し通常状態へ戻る
   *
   * - 設置済みの `waypoints` はクリアしない（次段階で経路計算に使う）
   */
  const handleWaypointDoneClick = useCallback(() => {
    setWaypointFlowState('idle')
  }, [])

  /**
   * 中継点選択モード中のセルクリック時。中継点を設置/除去する
   *
   * - 経由順の最近傍接続は次段階（issue #137 backlog）
   */
  const handleWaypointCellClick = useCallback((cell: HexCell) => {
    setWaypoints((prev) => {
      const index = prev.findIndex((waypoint) => isSameCell(waypoint, cell))

      return index === -1 ? [...prev, cell] : prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleCellChange = (cell: HexCell) => {
    setCurrentCell(cell)
    setPreviewPath([])
    setWaypointFlowState('idle')
    setWaypoints([])
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
      setGoalReached(true)
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
          interactive={waypointFlowState !== 'selecting'}
          onCellChange={handleCellChange}
          onNonAdjacentClick={handleNonAdjacentClick}
          registerCellVisibilityNode={registerFloorVisibilityNode}
          registerPlayerOverlayContainer={setPlayerOverlayContainer}
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
      {playerOverlayContainer &&
        createPortal(
          <WaypointBubble
            className={WAYPOINT_BUBBLE_POSITION_CLASS_NAME}
            onClick={handleWaypointBubbleClick}
            selectable={false}
            visible={waypointFlowState === 'proposing'}
          />,
          playerOverlayContainer,
        )}
      <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
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
