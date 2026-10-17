import { StoreApi } from 'zustand/vanilla'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * 経路に沿った自動移動の進行状況を保持する store
 *
 * - 「実行」時点の経路を固定し、移動したマス数を数える。残り経路のプレビュー
 *   （`PathPreviewLayer`）が進行に合わせて移動済みのマスを消すのに使う
 */
export type FollowPathState = {
  /** 1 マス進んだことを記録する（自動移動中でなければ何もしない） */
  advance: () => void
  /** 自動移動の終了（完了・途中停止とも）。経路・進んだマス数をクリアする */
  end: () => void
  /** 自動移動で進んだマス数（`followingPath` のうち移動済みの先頭側。bot がマスの中心に着いた時点で数える） */
  followedCount: number
  /** 自動移動中の経路（「実行」時点で固定する。自動移動中でなければ空） */
  followingPath: HexCell[]
  /** 自動移動中か（`followingPath` の有無から求める） */
  isFollowing: () => boolean
  /** 自動移動の開始。`path` を固定し、進んだマス数を 0 に戻す */
  start: (path: HexCell[]) => void
}

export type FollowPathStore = StoreApi<FollowPathState>
