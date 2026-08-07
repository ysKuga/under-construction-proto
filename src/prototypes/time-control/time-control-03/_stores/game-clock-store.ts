import { createStore, StoreApi } from 'zustand/vanilla'

import { ActionLogEntry, ActorId, EventLog } from '../types'

/**
 * 共通ゲームクロックに乗るイベント種別の総称
 *
 * - 現状は `ActionLogEntry` のみ。Collision 等の別イベント種別を追加する際は\
 *   ここに Union で追加していく想定 (game-clock-store 自体の実装変更は不要)
 */
export type GameEvent = ActionLogEntry

export type GameClockState = {
  /** 全 actor・全イベント共通の経過ゲーム時間 (ms)。各 actor の到達済みゲーム時間の最大値 */
  commonGameTimeMs: number
  /** 共通ゲームクロック由来の gameTimeMs を持つ、あらゆるイベントの時系列ログ */
  eventLog: EventLog<GameEvent>
  /**
   * イベントを記録する
   *
   * - `advanceTickMs` 省略時はクロックを進めず、現在の commonGameTimeMs を\
   *   そのまま使う (企図など「まだ何も消費していない」イベント向け)
   * - `advanceTickMs` 指定時は、そのイベントの actor 自身が最後に到達したゲーム時間\
   *   (`lastGameTimeMsById`、未到達なら0) にその分を加算した値を使う。actor 毎に\
   *   累積するため、tickRate が違う actor 同士でも互いの進行状況に引きずられない\
   *   (同じ tickMs で進む actor 同士は結果的に同じ値になり、履歴上1行にまとまる)
   * - commonGameTimeMs は記録した gameTimeMs の最大値まで進む (表示・スケジュール\
   *   プレビューの起点用、後退しない)
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

export const createGameClockStore = (): GameClockStore => {
  /** actor 毎に最後に到達したゲーム時間。tick 消費イベントの起点として使う */
  let lastGameTimeMsById: Partial<Record<ActorId, number>> = {}

  return createStore<GameClockState>((set, get) => ({
    ...INITIAL_STATE,
    logEvent: (<TEvent extends GameEvent>(
      payload: Omit<TEvent, 'gameTimeMs'>,
      advanceTickMs?: number,
    ): TEvent => {
      if (advanceTickMs === undefined) {
        const event = {
          ...payload,
          gameTimeMs: get().commonGameTimeMs,
        } as TEvent

        set((state) => ({
          eventLog: [...state.eventLog, { event, time: Date.now() }],
        }))

        return event
      }

      const { actorId } = payload as unknown as { actorId: ActorId }
      const baseTimeMs = lastGameTimeMsById[actorId] ?? 0
      const gameTimeMs = baseTimeMs + advanceTickMs
      const event = { ...payload, gameTimeMs } as TEvent

      lastGameTimeMsById[actorId] = gameTimeMs

      set((state) => ({
        commonGameTimeMs: Math.max(state.commonGameTimeMs, gameTimeMs),
        eventLog: [...state.eventLog, { event, time: Date.now() }],
      }))

      return event
    }) as GameClockState['logEvent'],
    reset: () => {
      lastGameTimeMsById = {}
      set(INITIAL_STATE)
    },
  }))
}
