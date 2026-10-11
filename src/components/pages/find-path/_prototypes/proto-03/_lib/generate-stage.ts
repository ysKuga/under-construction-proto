import { findHexPath } from '@/prototypes/stage/stage-07/_lib/hex-path'
import {
  colRowToAxial,
  HEX_DIRECTIONS,
  hexDistance,
  HexCell,
  isHexCellInGrid,
} from '@/prototypes/stage/stage-07/_lib/hex'

import {
  OneWayCell,
  OneWayDirection,
  StageLayout,
} from '../_contexts/stage-layout/types'

import { canEnterForPath } from './can-enter-for-path'
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

/** 開始セルからゴールへの最短手数（到達不能なら undefined） */
const shortestSteps = (
  layout: StageLayout,
  params: GenerateStageParams,
): number | undefined =>
  findHexPath(
    layout.start,
    layout.goal,
    params.grid.cols,
    params.grid.rows,
    (from, to) => canEnterForPath(from, to, layout),
  )?.length

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
 * 通行不能箇所を1つ、経路に効き進入禁止を生まない位置へ置く
 *
 * - 進入禁止（開始から到達できないセル）が生じる: 隣接する空きセルへ移す
 * - 無意味（加えても最短手数が変わらない）
 *   - 一方通行: 未試行の向きがあれば同じセルのまま向きを変える
 *   - 障害物・全方向試行済みの一方通行: 別の空きセルへ移す
 * - `maxRelocations` 回移しても置けなければ `undefined`
 */
const placeBlocker = (
  layout: StageLayout,
  kind: Blocker['kind'],
  freeCells: readonly HexCell[],
  params: GenerateStageParams,
  random: () => number,
): { blocker: Blocker; layout: StageLayout } | undefined => {
  /** 置く前の最短手数 */
  const baseSteps = shortestSteps(layout, params)
  /** 置き先のセル */
  let cell = pick(freeCells, random)
  /** 現在のセルで試した一方通行の向き */
  let triedDirections: OneWayDirection[] = []
  /** cell へ置く通行不能箇所を作る（一方通行は未試行の向きから選ぶ） */
  const createBlocker = (at: HexCell): Blocker | undefined => {
    if (kind === 'obstacle') return { cell: at, kind }

    const exitDirection = pick(
      ONE_WAY_DIRECTIONS.filter((d) => !triedDirections.includes(d)),
      random,
    )

    if (!exitDirection) return undefined

    triedDirections.push(exitDirection)

    return { cell: { ...at, exitDirection }, kind }
  }
  /** cell 以外の空きセル */
  const otherFreeCells = (at: HexCell) =>
    freeCells.filter((free) => !isSameCell(free, at))

  if (!cell) return undefined

  /** 判定中の通行不能箇所 */
  let blocker = createBlocker(cell)

  for (let i = 0; blocker && i <= params.maxRelocations; i++) {
    const candidate = withBlocker(layout, blocker)

    // 進入禁止が発生: 隣接する空きセルへ移す（なければ任意の空きセル）
    if (hasSealedCell(candidate, params)) {
      const from = blocker.cell
      const neighbors = otherFreeCells(from).filter(
        (free) => hexDistance(free, from) === 1,
      )

      cell = pick(neighbors, random) ?? pick(otherFreeCells(from), random)
      triedDirections = []
      blocker = cell && createBlocker(cell)
      continue
    }

    /** 加えたことで最短手数が延びたか */
    const isEffective = shortestSteps(candidate, params)! > baseSteps!

    // 経路に効いている: 採用する
    if (isEffective) return { blocker, layout: candidate }

    // 一方通行で未試行の向きがある: 同じセルで向きを変える
    blocker = kind === 'one-way' ? createBlocker(blocker.cell) : undefined

    if (blocker) continue

    // 向きを試し尽くした・障害物: 別の空きセルへ移す
    cell = pick(otherFreeCells(cell!), random)
    triedDirections = []
    blocker = cell && createBlocker(cell)
  }

  return undefined
}

/** 通行不能箇所はどれも、取り除くと最短手数が縮むか */
const isEveryBlockerEffective = (
  layout: StageLayout,
  params: GenerateStageParams,
): boolean => {
  const steps = shortestSteps(layout, params)!

  return (
    layout.obstacles.every(
      (_, i) =>
        shortestSteps(
          { ...layout, obstacles: layout.obstacles.filter((__, j) => j !== i) },
          params,
        )! < steps,
    ) &&
    layout.oneWays.every(
      (_, i) =>
        shortestSteps(
          { ...layout, oneWays: layout.oneWays.filter((__, j) => j !== i) },
          params,
        )! < steps,
    )
  )
}

/**
 * 乱数で盤面を1つ組み立てる
 *
 * - 開始・ゴールが近すぎる、通行不能箇所を置ききれない場合は `undefined`
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

  return layout
}

/**
 * seed から盤面配置を生成する
 *
 * - 同じ seed・params からは同じ配置を返す
 * - 各要素は互いに重ならないセルへ置く
 * - 開始セルとゴールの距離が `minGoalDistance` 未満の配置は捨てて作り直す（issue #315）
 * - 通行不能箇所（障害物・一方通行）は1つずつ置き、置くたびに判定して移し直す（issue #315）
 *   - 障害物以外のセルはすべて開始セルから到達できる（ゴール含む）
 *   - どれも取り除くと最短手数が縮む。満たさない配置は捨てて作り直す
 *   - 到達性は障害物・一方通行の壁のみで判定する。EN は考慮しない
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

    // 組み立てられ、後から置いた要素で無意味化したものもない: この配置を採用する
    if (layout && isEveryBlockerEffective(layout, params)) {
      return layout
    }
  }

  return undefined
}
