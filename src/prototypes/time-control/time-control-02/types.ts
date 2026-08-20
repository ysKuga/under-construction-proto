/** 履歴の1エントリ */
export type ActionLogEntry = {
  /** 発生元 actor */
  actorId: ActorId
  /**
   * ゲーム内経過時間 (ms、tick 単位の決定論的な値)
   *
   * - `TimeEvent.time` (実時刻) とは別物。実行タイミングの揺らぎに影響されず\
   *   常に tickMs の倍数になる
   */
  gameTimeMs: number
  /** 発生した段階 */
  phase: ActionPhase
  /** 関連する座標 */
  target: Position
}

/**
 * action-phase.md の5段階
 *
 * - 今回は intent/resolution のみ実際に発火する
 */
export type ActionPhase =
  'execution' | 'intent' | 'outcome' | 'pre-action' | 'resolution'

/** 段階ごとの所要時間 */
export type ActionTiming = {
  /** この段階の遷移に要する時間 (ms) */
  durationMs: number
  /** 対象の段階 */
  phase: ActionPhase
}

export type ActorId = string

/**
 * 時刻付きイベントログ本体
 *
 * - 持ち越し型 (処理後も破棄しない)
 */
export type EventLog<TEvent> = TimeEvent<TEvent>[]

/** マージ済み履歴の1行 */
export type HistoryRow = {
  /** この時刻に発生した actor ごとのエントリ */
  entryByActorId: Partial<Record<ActorId, ActionLogEntry>>
  /** ゲーム内経過時間 (ms) */
  gameTimeMs: number
}

/** 移動企図イベント */
export type MoveIntent = {
  /** 移動対象の actor */
  actorId: ActorId
  /** 移動先座標 */
  target: Position
}

/** tick ごとに分割した移動経路 */
export type MovePath = PathStep[]

/** 経路上の1点 */
export type PathStep = Position

/**
 * 自由座標
 *
 * - 制限・クランプなし
 */
export type Position = {
  /** X座標 */
  x: number
  /** Y座標 */
  y: number
}

/** 行動の進行モード */
export type ProgressMode = 'auto' | 'manual'

/** マージ済みスケジュールの1行 */
export type ScheduleRow = {
  /** この時刻に行動する actor 一覧 */
  actorIds: ActorId[]
  /** 経過時間 (ms) */
  timeMs: number
}

/**
 * 時間管理の基本単位
 *
 * - 時刻付きイベントログの1エントリ
 */
export type TimeEvent<TEvent> = {
  /** イベント本体 */
  event: TEvent
  /** イベント発生時刻 (epoch ms) */
  time: number
}
