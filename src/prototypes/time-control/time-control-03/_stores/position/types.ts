import { StoreApi } from 'zustand/vanilla'

import { ActorId, Position } from '../../types'

export type PositionState = {
  /** 行動決定 (単一 actor)。経路に沿って1tick分 (手動時) または最後まで (自動時) 進行する */
  dispatchAction: (actorId: ActorId) => void
  /**
   * 複数 actor の行動決定を1バッチとして実行する
   *
   * - 呼び出し開始時点の commonGameTimeMs を全 actor 共通の起点にする。\
   *   同一 tickMs の actor は同じ gameTimeMs で記録され履歴上1行にまとまる\
   *   (`dispatchAction` を actor 毎に逐次呼ぶと、後続の actor ほど先行 actor の\
   *   加算分だけ余計に進んでしまい、同時に行動決定したのに履歴が別行に分かれる)
   *
   * @param actorIds 対象 actor 一覧
   */
  dispatchActions: (actorIds: ActorId[]) => void
  /** actor の現在位置を取得する (未移動時はデフォルト値を返す) */
  getPosition: (actorId: ActorId) => Position
  /** actor ごとの現在位置。未移動の actor は含まれない */
  positionById: Record<ActorId, Position>
  /** 現在位置を初期状態に戻す */
  reset: () => void
}

export type PositionStore = StoreApi<PositionState>
