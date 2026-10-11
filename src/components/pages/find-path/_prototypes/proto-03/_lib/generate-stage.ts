import { findHexPath } from '@/prototypes/stage/stage-07/_lib/hex-path'
import {
  colRowToAxial,
  hexDistance,
  HexCell,
} from '@/prototypes/stage/stage-07/_lib/hex'

import { OneWayDirection, StageLayout } from '../_contexts/stage-layout/types'

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

/** 乱数で盤面を1つ組み立てる（到達性は問わない） */
const buildLayout = (
  params: GenerateStageParams,
  random: () => number,
): StageLayout => {
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

  return {
    goal,
    items: takeCells(params.items.count).map((cell) => ({
      ...cell,
      amount: params.items.amount,
    })),
    obstacles: takeCells(params.obstacleCount),
    oneWays: takeCells(params.oneWayCount).map((cell) => ({
      ...cell,
      exitDirection:
        ONE_WAY_DIRECTIONS[Math.floor(random() * ONE_WAY_DIRECTIONS.length)],
    })),
    spots: takeCells(params.spots.count).map((cell) => ({
      ...cell,
      amount: params.spots.amount,
      stock: params.spots.stock,
    })),
    start,
  }
}

/** 開始セルからゴールへ、障害物・一方通行の壁を避けて到達できるか */
const isGoalReachable = (
  layout: StageLayout,
  params: GenerateStageParams,
): boolean =>
  findHexPath(
    layout.start,
    layout.goal,
    params.grid.cols,
    params.grid.rows,
    (from, to) => canEnterForPath(from, to, layout),
  ) !== undefined

/**
 * seed から盤面配置を生成する
 *
 * - 同じ seed・params からは同じ配置を返す
 * - 各要素は互いに重ならないセルへ置く
 * - 開始セルとゴールの距離が `minGoalDistance` 未満の配置は捨てて作り直す（issue #315）
 * - ゴールへ到達できない配置は捨てて作り直す（issue #315）
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
    /** 開始セルとゴールが十分に離れているか */
    const isGoalFarEnough =
      hexDistance(layout.start, layout.goal) >= params.minGoalDistance

    // 十分に離れ、かつ到達できる: この配置を採用する
    if (isGoalFarEnough && isGoalReachable(layout, params)) {
      return layout
    }
  }

  return undefined
}
