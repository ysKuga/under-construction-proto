import { HexCell, hexDistance } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * 中継点の経由順を最近傍法で決める
 *
 * - `start` から、未経由の中継点のうち直前地点に最も近いものを順に選ぶ
 * - 距離は `hexDistance`(障害物を考慮しない直線的な歩数)。厳密な最適解(TSP)は求めない
 * - 距離が同じ場合は `waypoints` の並び(設置順)を優先する
 *
 * @param start 経由を開始する地点(bot の現在位置)
 * @param waypoints 設置済みの中継点(設置順)
 */
export const orderWaypoints = (
  start: HexCell,
  waypoints: readonly HexCell[],
): HexCell[] => {
  const remaining = [...waypoints]
  const ordered: HexCell[] = []
  let cursor = start

  while (remaining.length > 0) {
    let nearestIndex = 0

    for (let i = 1; i < remaining.length; i++) {
      if (
        hexDistance(cursor, remaining[i]) <
        hexDistance(cursor, remaining[nearestIndex])
      ) {
        nearestIndex = i
      }
    }

    cursor = remaining.splice(nearestIndex, 1)[0]
    ordered.push(cursor)
  }

  return ordered
}
