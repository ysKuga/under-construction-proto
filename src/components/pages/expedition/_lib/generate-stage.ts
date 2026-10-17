import {
  colRowToAxial,
  HEX_DIRECTIONS,
  hexDistance,
  HexCell,
  isHexCellInGrid,
} from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

import {
  OneWayCell,
  OneWayDirection,
  StageLayout,
} from '../_contexts/stage-layout/types'

import { canEnterForPath } from './can-enter-for-path'
import {
  canReachGoalWithEnergy,
  StageEnergyRule,
} from './can-reach-goal-with-energy'
import { createRandom } from './create-random'

/** 一方通行の退出方向の候補 */
const ONE_WAY_DIRECTIONS: readonly OneWayDirection[] = [
  'left',
  'lower-left',
  'lower-right',
  'right',
  'upper-left',
  'upper-right',
]

/** 盤面生成の条件 */
export type GenerateStageParams = {
  /** EN の条件（ゴールへの到達判定に使う） */
  energy: StageEnergyRule
  /** グリッド形状 */
  grid: {
    /** 列数 */
    cols: number
    /** 行数 */
    rows: number
  }
  /** EN 補給アイテム */
  items: {
    /** 1 個あたりの補給量 */
    amount: number
    /** 個数 */
    count: number
  }
  /** 生成をやり直す上限回数 */
  maxAttempts: number
  /** 通行不能箇所1つあたりの移し直しの上限回数 */
  maxRelocations: number
  /** 開始セルとゴールの距離の下限（隣接等の自明な盤面を避ける） */
  minGoalDistance: number
  /** 障害物の個数 */
  obstacleCount: number
  /** 一方通行の個数 */
  oneWayCount: number
  /** EN スポット */
  spots: {
    /** 1 回の補給あたりの補給量 */
    amount: number
    /** 個数 */
    count: number
    /** 補給回数 */
    stock: number
  }
}

/** 乱数で配列をシャッフルした新しい配列を返す（Fisher-Yates） */
const shuffle = <T>(values: readonly T[], random: () => number): T[] => {
  const result = [...values]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))

    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/** 配列から乱数で1つ選ぶ（空なら undefined） */
const pick = <T>(values: readonly T[], random: () => number): T | undefined =>
  values[Math.floor(random() * values.length)]

/** 2セルが同じか */
const isSameCell = (a: HexCell, b: HexCell): boolean =>
  a.q === b.q && a.r === b.r

/** 障害物以外に、開始セルから到達できないセルがあるか */
const hasSealedCell = (
  layout: StageLayout,
  params: GenerateStageParams,
): boolean => {
  const { cols, rows } = params.grid
  /** 到達済みセルのキー */
  const reached = new Set([`${layout.start.q},${layout.start.r}`])
  const queue = [layout.start]

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const direction of HEX_DIRECTIONS) {
      const next = { q: current.q + direction.q, r: current.r + direction.r }
      const key = `${next.q},${next.r}`

      if (!isHexCellInGrid(next, cols, rows)) continue
      if (reached.has(key)) continue
      if (!canEnterForPath(current, next, layout)) continue

      reached.add(key)
      queue.push(next)
    }
  }

  return reached.size < cols * rows - layout.obstacles.length
}

/** 通行不能箇所の候補（障害物、または退出方向付きの一方通行） */
type Blocker =
  { cell: HexCell; kind: 'obstacle' } | { cell: OneWayCell; kind: 'one-way' }

/** 盤面へ通行不能箇所を1つ加えた盤面を返す */
const withBlocker = (layout: StageLayout, blocker: Blocker): StageLayout =>
  blocker.kind === 'obstacle'
    ? { ...layout, obstacles: [...layout.obstacles, blocker.cell] }
    : { ...layout, oneWays: [...layout.oneWays, blocker.cell] }

/**
 * 通行不能箇所を1つ、進入禁止を生まない位置へ置く
 *
 * - 進入禁止（開始から到達できないセル）が生じる: 隣接する空きセルへ移す（なければ任意の空きセル）
 *   - 一方通行は向きを保ったまま移す
 * - `maxRelocations` 回移しても置けなければ `undefined`
 */
const placeBlocker = (
  layout: StageLayout,
  kind: Blocker['kind'],
  freeCells: readonly HexCell[],
  params: GenerateStageParams,
  random: () => number,
): { blocker: Blocker; layout: StageLayout } | undefined => {
  /** 最初の置き先のセル */
  const initialCell = pick(freeCells, random)

  if (!initialCell) return undefined

  /** 一方通行の退出方向（移しても保つ） */
  const exitDirection = pick(ONE_WAY_DIRECTIONS, random)!
  /** cell へ置く通行不能箇所を作る */
  const createBlocker = (at: HexCell): Blocker =>
    kind === 'obstacle'
      ? { cell: at, kind }
      : { cell: { ...at, exitDirection }, kind }
  /** 判定中の通行不能箇所 */
  let blocker = createBlocker(initialCell)

  for (let i = 0; i <= params.maxRelocations; i++) {
    const candidate = withBlocker(layout, blocker)

    // 進入禁止が発生しない: 採用する
    if (!hasSealedCell(candidate, params)) {
      return { blocker, layout: candidate }
    }

    const from = blocker.cell
    /** 現在のセル以外の空きセル */
    const otherFreeCells = freeCells.filter((free) => !isSameCell(free, from))
    /** 移し先（隣接する空きセルを優先） */
    const next =
      pick(
        otherFreeCells.filter((free) => hexDistance(free, from) === 1),
        random,
      ) ?? pick(otherFreeCells, random)

    // 移し先がない: 置けない
    if (!next) return undefined

    blocker = createBlocker(next)
  }

  return undefined
}

/**
 * 乱数で盤面を1つ組み立てる
 *
 * - 開始・ゴールが近すぎる、通行不能箇所を置ききれない、EN が足りずゴールへ到達できない場合は `undefined`
 */
const buildLayout = (
  params: GenerateStageParams,
  random: () => number,
): StageLayout | undefined => {
  const { cols, rows } = params.grid
  const cells = shuffle(
    Array.from({ length: cols * rows }, (_, index) =>
      colRowToAxial(index % cols, Math.floor(index / cols)),
    ),
    random,
  )
  let cursor = 0
  /** シャッフル済みセルを先頭から n 個取り出す（要素同士で重ならない） */
  const takeCells = (n: number): HexCell[] => {
    const taken = cells.slice(cursor, cursor + n)

    cursor += n

    return taken
  }

  const [start] = takeCells(1)
  const [goal] = takeCells(1)

  // 開始セルとゴールが近すぎる: 自明な盤面のため作り直す
  if (hexDistance(start, goal) < params.minGoalDistance) return undefined

  let layout: StageLayout = {
    goal,
    items: takeCells(params.items.count).map((cell) => ({
      ...cell,
      amount: params.items.amount,
    })),
    obstacles: [],
    oneWays: [],
    spots: takeCells(params.spots.count).map((cell) => ({
      ...cell,
      amount: params.spots.amount,
      stock: params.spots.stock,
    })),
    start,
  }
  /** 通行不能箇所を置ける空きセル */
  let freeCells = cells.slice(cursor)
  /** 置く通行不能箇所の種類（置く順） */
  const kinds: Blocker['kind'][] = [
    ...Array<Blocker['kind']>(params.obstacleCount).fill('obstacle'),
    ...Array<Blocker['kind']>(params.oneWayCount).fill('one-way'),
  ]

  for (const kind of kinds) {
    const placed = placeBlocker(layout, kind, freeCells, params, random)

    // 置ききれない: 作り直す
    if (!placed) return undefined

    layout = placed.layout
    freeCells = freeCells.filter(
      (free) => !isSameCell(free, placed.blocker.cell),
    )
  }

  // EN が足りずゴールへ到達できない: 作り直す
  if (!canReachGoalWithEnergy(layout, params.grid, params.energy)) {
    return undefined
  }

  return layout
}

/**
 * seed から盤面配置を生成する
 *
 * - 同じ seed・params からは同じ配置を返す
 * - 各要素は互いに重ならないセルへ置く
 * - 開始セルとゴールの距離が `minGoalDistance` 未満の配置は捨てて作り直す（issue #315）
 * - 通行不能箇所（障害物・一方通行）は1つずつ置き、進入禁止が生じたら隣接セルへ移し直す（issue #315）
 *   - 障害物以外のセルはすべて開始セルから到達できる（ゴール含む）
 *   - 進入禁止の判定は障害物・一方通行の壁のみで行う。EN は考慮しない
 * - EN（アイテム・スポット込み）が足りずゴールへ到達できない配置は捨てて作り直す（issue #315）
 * - `maxAttempts` 回作り直しても条件を満たす配置が得られなければ `undefined`
 * - 要素の総数がグリッドのセル数を超える場合は例外を投げる
 *
 * @param seed 乱数の種
 * @param params 生成条件
 */
export const generateStage = (
  seed: number,
  params: GenerateStageParams,
): StageLayout | undefined => {
  /** 配置する要素の総数（開始・ゴール含む） */
  const elementCount =
    2 +
    params.obstacleCount +
    params.oneWayCount +
    params.items.count +
    params.spots.count

  // セルが足りない: 重ならない配置が作れない
  if (elementCount > params.grid.cols * params.grid.rows) {
    throw new Error(
      `要素数 ${elementCount} がセル数 ${params.grid.cols * params.grid.rows} を超えている`,
    )
  }

  const random = createRandom(seed)

  for (let attempt = 0; attempt < params.maxAttempts; attempt++) {
    const layout = buildLayout(params, random)

    // 組み立てられた: この配置を採用する
    if (layout) {
      return layout
    }
  }

  return undefined
}
