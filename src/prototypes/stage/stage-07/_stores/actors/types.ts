import { StoreApi } from 'zustand/vanilla'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { HexCell } from '../../_lib/hex'

/**
 * hex グリッド上の actor(player・mob 共通)位置を保持する store
 *
 * - player・mob を区別せず `actorId` で一元管理する。player 固有の移動検証(隣接判定・
 *   進入可否)は `useHexMove` の責務、ここでは state 更新のみ行う
 */
export type ActorsState = {
  /** actorId ごとの現在セル */
  actors: Record<ActorId, HexCell>
  /** actor を取り除く */
  despawnActor: (actorId: ActorId) => void
  /** actor を target セルへ移動する */
  moveActor: (actorId: ActorId, target: HexCell) => void
  /**
   * actorId ごとのオーバーレイ注入用コンテナ DOM
   *
   * - `ActorsLayer` が actor の位置決め div 内に用意し、`registerOverlayContainer`
   *   で登録する。呼び出し側はこの DOM へ `createPortal` で任意の要素（bot 頭上に
   *   表示したい UI 等）を注入できる。actor に紐づく実装のため、props drilling
   *   （`Stage07`→`ActorsLayer`）でなく store 経由にした（issue #137）
   */
  overlayContainers: Partial<Record<ActorId, HTMLDivElement>>
  /**
   * actorId の位置決め div 内のオーバーレイ注入用コンテナ DOM を登録する
   *
   * - `ActorsLayer` の ref コールバックから呼ぶ。unmount 時は `el=null` で呼ばれる
   *   （`registerVisibilityNode` 等と同じパターン）
   */
  registerOverlayContainer: (
    actorId: ActorId,
    el: HTMLDivElement | null,
  ) => void
  /** actor を新規配置する(既存 actorId の場合は上書き) */
  spawnActor: (actorId: ActorId, cell: HexCell) => void
}

export type ActorsStore = StoreApi<ActorsState>
