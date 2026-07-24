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

/**
 * 時刻付きイベントログ本体
 *
 * - 持ち越し型 (処理後も破棄しない)
 */
export type EventLog<TEvent> = TimeEvent<TEvent>[]

/** drag/click/drop 判定に使う生イベント種別 */
export type PointerRawEventType = 'focus' | 'focusout' | 'mousedown' | 'mouseup'

/** 生イベント (対象要素の識別子を伴う) */
export type PointerRawEvent = {
  /** 発生元要素の識別子 */
  targetId: string
  /** 生イベント種別 */
  type: PointerRawEventType
}

/** drag/click/drop 判定の状態 */
export type PointerState = 'idle' | 'pressed-blurred' | 'pressed'

/**
 * 確定した判定結果
 *
 * - ドラッグ中の追跡は対象外、click/drop の確定のみ扱う
 */
export type PointerResolution = 'click' | 'drop'

/**
 * 状態遷移の結果
 *
 * - resolved は click/drop 確定時のみ付与
 */
export type PointerTransition = {
  /** 遷移後の状態 */
  nextState: PointerState
  /** 確定した判定結果。未確定なら undefined */
  resolved?: PointerResolution
}
