import { createStore, StoreApi } from 'zustand/vanilla'

import { ActionLogEntry, EventLog } from '../types'

/**
 * 共通ゲームクロックに乗るイベント種別の総称
 *
 * - 現状は `ActionLogEntry` のみ。Collision 等の別イベント種別を追加する際は\
 *   ここに Union で追加していく想定 (game-clock-store 自体の実装変更は不要)
 */
export type GameEvent = ActionLogEntry

export type GameClockState = {
  /** 全 actor・全イベント共通の経過ゲーム時間 (ms) */
  commonGameTimeMs: number
  /** 共通ゲームクロック由来の gameTimeMs を持つ、あらゆるイベントの時系列ログ */
  eventLog: EventLog<GameEvent>
  /**
   * イベントを記録する
   *
   * - `advanceTickMs` 省略時はクロックを進めず、現在の commonGameTimeMs を\
   *   そのまま使う (企図など「まだ何も消費していない」イベント向け)
   * - `advanceTickMs` 指定時はクロックをその分進めてから新しい値を使う\
   *   (tick の消費を伴うイベント向け。実行順で単調増加・非重複を保証する)
   *
   * @param payload gameTimeMs を除いたイベント本体
   * @param advanceTickMs クロックを進める量 (ms)
   */
  logEvent: <TEvent extends GameEvent>(
    payload: Omit<TEvent, 'gameTimeMs'>,
    advanceTickMs?: number,
  ) => TEvent
  /** 共通ゲームクロック・履歴を初期状態に戻す */
  reset: () => void
}

export type GameClockStore = StoreApi<GameClockState>

const INITIAL_STATE = {
  commonGameTimeMs: 0,
  eventLog: [],
} satisfies Partial<GameClockState>

export const createGameClockStore = (): GameClockStore =>
  createStore<GameClockState>((set, get) => ({
    ...INITIAL_STATE,
    logEvent: (<TEvent extends GameEvent>(
      payload: Omit<TEvent, 'gameTimeMs'>,
      advanceTickMs = 0,
    ): TEvent => {
      const gameTimeMs = get().commonGameTimeMs + advanceTickMs
      const event = { ...payload, gameTimeMs } as TEvent

      set((state) => ({
        commonGameTimeMs: gameTimeMs,
        eventLog: [...state.eventLog, { event, time: Date.now() }],
      }))

      return event
    }) as GameClockState['logEvent'],
    reset: () => {
      set(INITIAL_STATE)
    },
  }))
