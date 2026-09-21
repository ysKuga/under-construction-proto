'use client'

import { useRef, useState } from 'react'
import { match } from 'ts-pattern'

import {
  EnergyStoreProvider,
  isEnergyEventForActor,
  useEnergyEventDispatcher,
  useEnergyEventListener,
  useEnergyStore,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07 } from '@/prototypes/stage/stage-07'
import { ActorNodeRegistryProvider } from '@/prototypes/stage/stage-07/_contexts/actor-node-registry'
import { CellTitleProvider } from '@/prototypes/stage/stage-07/_contexts/cell-title'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { EnergyDebugPanel } from '../_components/energy-debug-panel'

import { GoalMarkerLayer } from './_components/goal-marker-layer'
import { ItemLayer } from './_components/item-layer'
import {
  MoveTargetDisplayMode,
  MoveTargetLayer,
} from './_components/move-target-layer'
import { ObstacleLayer } from './_components/obstacle-layer'
import { OneWayLayer } from './_components/one-way-layer'
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

/** axial セルの一致判定 */
const isSameCell = (a: HexCell, b: HexCell) => a.q === b.q && a.r === b.r

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
 * - `ActorNodeRegistryProvider`（hex 版）は actor の現在セルを保持する Provider。
 *   `Stage07` の外側に置く（issue #181 PR-A。tick 駆動実行の追加に備え、外部から
 *   クリックを介さず actor を動かせるようにするため）
 * - EN（エネルギー、issue #181）: 1 マス移動するごとに 1 消費する。予定経路・tick
 *   駆動の「実行」は proto-01 と異なり導入しない（1 マスごとの隣接クリック移動の
 *   まま）ため、`canEnterCell` へ残量判定を加え、移動成立時に `Energy-consume`
 *   イベントを dispatch する（実消費・0 以下の判定・`Energy-depleted` 発行は
 *   energy store 側の consume-listener が担う。proto-01 の `use-find-path-tick`
 *   と同じ経路）
 * - EN 切れ演出（予防姿勢、issue #181、proto-01 の `energyOutAction` 相当）:
 *   `Stage07` が `actorEventTarget` prop 経由で bot と共有する EventTarget を公開
 *   するようにし（stage-06 と同じ方式）、page 側で `useBoxBotActionDispatcher`
 *   から `energyOut` dispatcher を得る。トグル方式の action のため、
 *   `Energy-depleted` 購読で発火した後は `outOfEnergyRef` で発火中かを追跡し、
 *   回復発生時（`handleCellChange` の即時回復（今回のリファクタ対象外）または
 *   `EnergyDebugPanel` の `+1`（`Energy-recovered` 購読）のいずれか）に
 *   再度 dispatch して復帰させる
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
        <ActorNodeRegistryProvider initialCell={START_POSITION}>
          <VisibilityRegistryProvider>
            <FindPathProto03Content
              onReset={() => setResetKey((key) => key + 1)}
            />
          </VisibilityRegistryProvider>
        </ActorNodeRegistryProvider>
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
  const { markVisited, registerVisibilityNode, setShowVisited } =
    useVisibilityRegistry()
  const energyStoreApi = useEnergyStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
  const itemStoreApi = useItemStoreApi()

  const [actorEventTarget] = useState<EventTarget>(() => new EventTarget())
  const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
    energyOutAction,
  ])
  /**
   * EN 切れ演出(予防姿勢)が発火中か(トグル方式のため呼び出し側で追跡する)
   *
   * - proto-01 の `outOfEnergyRef` と同じ役割。EN 切れ検知(`Energy-depleted`)・\
   *   `EnergyDebugPanel` の `+1` による復帰検知(`Energy-recovered`)は energy
   *   store 側の consume/recover-listener が担うため下記 `useEnergyEventListener`
   *   で購読する。回復アイテムによる復帰（`handleCellChange` の即時回復）は
   *   今回のリファクタ対象外のまま、直接判定で false に戻す（proto-01 と同じ分担）
   */
  const outOfEnergyRef = useRef(false)

  // Energy-depleted（energy store 側の consume-listener が EN 消費後に発行）を
  // 購読し、EN 切れ演出（energyOut）を発火する
  useEnergyEventListener('Energy-depleted', (event) => {
    // 自分の actor 宛て・まだ切れていない場合のみ発火する
    match({
      isOwnActor: isEnergyEventForActor(event, PLAYER_ACTOR_ID),
      outOfEnergy: outOfEnergyRef.current,
    }).with({ isOwnActor: true, outOfEnergy: false }, () => {
      outOfEnergyRef.current = true
      void energyOut()
    })
  })

  // Energy-recovered（energy store 側の recover-listener が EN 回復後に発行。
  // EnergyDebugPanel の +1 経由）を購読し、EN 切れ演出から復帰させる
  useEnergyEventListener('Energy-recovered', (event) => {
    // 自分の actor 宛て・切れ状態の場合のみ復帰させる
    match({
      isOwnActor: isEnergyEventForActor(event, PLAYER_ACTOR_ID),
      outOfEnergy: outOfEnergyRef.current,
    }).with({ isOwnActor: true, outOfEnergy: true }, () => {
      outOfEnergyRef.current = false
      void energyOut()
    })
  })

  const handleCellChange = (cell: HexCell) => {
    setCurrentCell(cell)
    markVisited(cell)

    const item = itemStoreApi.getState().getItemAtCell(cell)
    const consumed = item && itemStoreApi.getState().consumeItem(item.id)

    if (consumed) {
      energyStoreApi.getState().recover(PLAYER_ACTOR_ID, consumed.amount)

      if (outOfEnergyRef.current) {
        outOfEnergyRef.current = false
        void energyOut()
      }
    }

    // 消費自体は Energy-consume イベント経由（energy store 側の consume-listener が
    // 実処理・閾値判定・Energy-depleted 発行を担う。proto-01 の `use-find-path-tick`
    // と同じ経路）
    void energyDispatch['Energy-consume']({
      actorId: PLAYER_ACTOR_ID,
      amount: 1,
    })

    if (isSameCell(cell, GOAL_POSITION)) {
      setGoalReached(true)
    }
  }

  /** 進入拒否条件一覧（`EnterGuard`） */
  const enterGuards: EnterGuard[] = [
    { check: () => energyInfo.current > 0, kind: 'perceived' },
    { check: (cell) => !isObstacleCell(cell), kind: 'perceived' },
    {
      check: (cell) => !isBlockedByOneWay(currentCell, cell),
      kind: 'perceived',
    },
  ]

  /** 移動可能マスガイド等、表示に使う進入可否（`perceived` ガードのみ） */
  const canEnterCellPerceived = (cell: HexCell) =>
    enterGuards
      .filter((guard) => guard.kind === 'perceived')
      .every((guard) => guard.check(cell))

  /** 実際の移動判定に使う進入可否（全ガード） */
  const canEnterCell = (cell: HexCell) =>
    enterGuards.every((guard) => guard.check(cell))

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
          botSize={56}
          canEnterCell={canEnterCell}
          cols={GRID.cols}
          enableWalking={enableWalking}
          hexSize={HEX_SIZE}
          initialTiltDeg={55}
          onCellChange={handleCellChange}
          registerCellVisibilityNode={(cell, el) =>
            registerVisibilityNode(cell, 'floor', el)
          }
          rows={GRID.rows}
        >
          <GoalMarkerLayer
            cols={GRID.cols}
            hexSize={HEX_SIZE}
            registerVisibilityNode={(cell, el) =>
              registerVisibilityNode(cell, 'marker', el)
            }
            rows={GRID.rows}
          />
          <ObstacleLayer
            cols={GRID.cols}
            hexSize={HEX_SIZE}
            registerVisibilityNode={(cell, el) =>
              registerVisibilityNode(cell, 'marker', el)
            }
            rows={GRID.rows}
          />
          <OneWayLayer
            cols={GRID.cols}
            hexSize={HEX_SIZE}
            registerVisibilityNode={(cell, el) =>
              registerVisibilityNode(cell, 'marker', el)
            }
            rows={GRID.rows}
          />
          <ItemLayer
            cols={GRID.cols}
            hexSize={HEX_SIZE}
            registerVisibilityNode={(cell, el) =>
              registerVisibilityNode(cell, 'marker', el)
            }
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
        </Stage07>
      </CellTitleProvider>
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
      </div>
      <EnergyDebugPanel />
    </div>
  )
}

export default FindPathProto03
