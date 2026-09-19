import { CSSProperties } from 'react'

import { useActorNodeRegistry } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { usePlannedPathStore } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { usePlannedPathCellRegistry } from '../../_contexts/planned-path-cell-registry'
import { usePlannedPathSteps } from '../../_hooks/use-planned-path-steps'
import { describeCellContent } from '../../_lib/describe-cell-content'
import { isObstacleCell } from '../../_lib/obstacle'
import { isBlockedByOneWay } from '../../_lib/one-way'
import { useItemStore } from '../../_stores/items'

type PlannedPathLayerProps = {
  /**
   * 選択済みセルへの重複選択を許可するか（比較試作、既定 true）
   *
   * - false のとき、既に選択済み（`orders.length > 0`）のセルのクリックを無視する。
   *   最終的にはこちらを既定にする方針（段階 5 の隣接マス制限と合わせて検討）
   */
  allowDuplicateSelection?: boolean
  /** 列数 */
  cols: number
  /**
   * tick 走行中か
   *
   * - 走行中はセル選択（`appendStep`）を無効化する。走行中に追加した指定は
   *   実行用の残り経路（path store）へ反映されず「消化されない指定」になるため
   */
  isRunning: boolean
  /** 行数 */
  rows: number
  /**
   * 同じセルを複数回選択した場合の番号表示方式（比較試作、既定は `'list'`）
   *
   * - `'list'`: カンマ区切りで列挙し、収まらない分は ellipsis で省略する
   * - `'stacked'`: セルに要素を重ねて表示する。最前面が最も若い番号、到達ごとに
   *   その要素をフェードアウトして下の要素を露出させる
   */
  variant?: 'list' | 'stacked'
}

/**
 * セル1マスのベーススタイル（枠・カーソル等。番号表示部分は別途重ねる）
 *
 * - `list` variant の背景・枠線は、そのセルの最後の番号が消化された時点で\
 *   `PlannedPathCellRegistryProvider.fadeOutCell` が DOM 直書きで transparent に\
 *   戻す（`transition` で滑らかに消える）
 */
const cellStyle = (
  hasOrders: boolean,
  variant: 'list' | 'stacked',
  isBlocked: boolean,
): CSSProperties => ({
  alignItems: 'center',
  background:
    variant === 'list' && hasOrders
      ? 'rgba(56, 189, 248, 0.35)'
      : 'transparent',
  border:
    variant === 'list' && hasOrders
      ? '1px solid #0284c7'
      : '1px solid transparent',
  color: '#0c4a6e',
  cursor: isBlocked ? 'not-allowed' : 'pointer',
  display: 'flex',
  font: 'inherit',
  fontWeight: 700,
  justifyContent: 'center',
  padding: 0,
  position: 'relative',
  transition: 'background 300ms, border-color 300ms',
})

/** 番号一覧のラベル（list variant）。収まらない分は ellipsis で省略する */
const labelStyle: CSSProperties = {
  display: 'block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

/** 番号 1 つぶんのスタイル（list variant。到達時に個別でフェードアウトする） */
const stepStyle: CSSProperties = {
  opacity: 1,
  transition: 'opacity 300ms',
}

/**
 * 番号 1 つぶんのスタイル（stacked variant）
 *
 * - セル全体を隙間なく覆う正方形を重ね、若い番号ほど手前（`zIndex` 大）にする。
 *   ずらさず完全に重ねる（下の要素は最前面の要素に隠れて見えない）
 * - 重なっている（`count > 1`）ときだけ最前面（`index === 0`）を不透明にする。
 *   1 枚のみのときは通常どおり半透明。他（隠れている要素）も半透明のまま
 * - 到達時にフェードアウトすると下の要素が露出する
 */
const stackedStepStyle = (index: number, count: number): CSSProperties => ({
  alignItems: 'center',
  background:
    index === 0 && count > 1
      ? 'rgba(56, 189, 248, 1)'
      : 'rgba(56, 189, 248, 0.55)',
  border: '1px solid #0284c7',
  borderRadius: 2,
  display: 'flex',
  inset: 0,
  justifyContent: 'center',
  opacity: 1,
  position: 'absolute',
  transition: 'opacity 300ms',
  zIndex: count - index,
})

/**
 * 予定経路の積み込みレイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   セルクリックで予定経路の末尾へその座標を push する
 * - 予定経路に含まれるセルには積んだ順番（1 始まり）を表示する。同じセルを複数回
 *   選択した場合の表示は `variant` で切り替える（list = 列挙 / stacked = 重ねる）。
 *   `allowDuplicateSelection=false` なら重複選択自体を無効化する
 * - tick 走行中（`isRunning`）はセル選択を disabled にする
 * - planned-path / item store を購読。bot の移動（path / position）では再レンダリングしない
 * - セル本体（`button`）へ `title` を付与し、障害物・回復アイテム・回復スポットの
 *   説明を hover 表示する（issue #137）。対応する表示レイヤー（`ObstacleLayer` 等）は
 *   `pointerEvents: none` の非対話オーバーレイで hover を受け取れないため、実際に
 *   マウスオーバーを受けるここへ持たせる。説明対象は `ItemStore.getContentsAtCell`
 *   （障害物・アイテムを統合した位置ベースの問い合わせ、PR #196 レビュー対応）から
 *   取得し、文言は `describeCellContent`（`ItemKind` ベースの辞書）で解決する。
 *   新しい種類のアイテムが増えても辞書へ追記するだけで対応できる
 * - 番号（`order`）ごとに個別の DOM を `PlannedPathCellRegistryProvider` へ登録する。
 *   到達済み番号のフェードアウト（`useFindPathTick`）はここを経由して opacity を\
 *   直書きする（再レンダリングなし）。`order` は経路計画中つねに新しい値が発行される\
 *   ため、フェードアウト済み番号の巻き戻し（旧 `resetCell`）は不要
 */
export const PlannedPathLayer = (props: PlannedPathLayerProps) => {
  const {
    allowDuplicateSelection = true,
    cols,
    isRunning,
    rows,
    variant = 'list',
  } = props

  const { appendStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const { registerCellNode, registerStepNode } = usePlannedPathCellRegistry()
  const { getActorPosition } = useActorNodeRegistry()
  const planned = usePlannedPathStore((state) =>
    state.getPlannedPath(PLAYER_ACTOR_ID),
  )
  const itemStore = useItemStore((state) => state)

  /** "col,row" → 積んだ順番（1 始まり）の一覧。同じセルを複数回選択すると複数持つ */
  const ordersByCell = new Map<string, number[]>()
  planned.forEach((position, index) => {
    const key = `${position.x},${position.y}`

    ordersByCell.set(key, [...(ordersByCell.get(key) ?? []), index + 1])
  })

  /** 一方通行判定の直前セル（予定経路の末尾、空なら actor の現在セル） */
  const lastPlannedPosition = planned[planned.length - 1]
  const precedingCell = lastPlannedPosition
    ? { col: lastPlannedPosition.x, row: lastPlannedPosition.y }
    : getActorPosition(PLAYER_ACTOR_ID)

  const overlayStyle: CSSProperties = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    inset: 0,
    position: 'absolute',
  }

  return (
    <div style={overlayStyle}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const orders = ordersByCell.get(`${col},${row}`) ?? []
          const isBlocked =
            isObstacleCell({ col, row }) ||
            isBlockedByOneWay(precedingCell, { col, row })
          const contents = itemStore.getContentsAtCell({ col, row })
          const title = contents[0] && describeCellContent(contents[0])

          return (
            <button
              aria-label={`予定経路へ ${col}-${row} を追加`}
              disabled={isRunning || isBlocked}
              key={`${row}-${col}`}
              onClick={() => {
                if (!allowDuplicateSelection && orders.length > 0) {
                  return
                }

                appendStep({ col, row })
              }}
              ref={(el) => registerCellNode({ col, row }, el)}
              style={cellStyle(orders.length > 0, variant, isBlocked)}
              title={title}
              type="button"
            >
              {variant === 'stacked' ? (
                orders.map((order, i) => (
                  <span
                    key={order}
                    ref={(el) => registerStepNode(order, el)}
                    style={stackedStepStyle(i, orders.length)}
                  >
                    {order}
                  </span>
                ))
              ) : (
                <span style={labelStyle}>
                  {orders.map((order, i) => (
                    <span
                      key={order}
                      ref={(el) => registerStepNode(order, el)}
                      style={stepStyle}
                    >
                      {order}
                      {i < orders.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </span>
              )}
            </button>
          )
        }),
      )}
    </div>
  )
}
