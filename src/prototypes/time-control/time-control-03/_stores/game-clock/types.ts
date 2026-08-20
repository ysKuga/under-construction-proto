import { StoreApi } from 'zustand/vanilla'

import { ActionLogEntry, ActorId, EventLog, HistoryRow } from '../../types'

export type GameClockState = {
  /** 全 actor・全イベント共通の経過ゲーム時間 (ms)。直近まで記録された到達済みゲーム時間 */
  commonGameTimeMs: number
  /** 共通ゲームクロック由来の gameTimeMs を持つ、あらゆるイベントの時系列ログ */
  eventLog: EventLog<GameEvent>
  /**
   * eventLog から、gameTimeMs でマージした履歴行を生成する
   *
   * - 同一 gameTimeMs の複数 actor は1行にまとめる
   *
   * @param actorIds 対象 actor 一覧
   */
  getHistory: (actorIds: ActorId[]) => HistoryRow[]
  /**
   * イベントを記録する
   *
   * - `advanceTickMs` 省略時はクロックを進めず、現在の commonGameTimeMs を\
   *   そのまま使う (企図など「まだ何も消費していない」イベント向け)
   * - `advanceTickMs` 指定時は、現在の commonGameTimeMs にその分を加算した値を使う。\
   *   全 actor 共通の到達点を起点にするため、後から行動決定した actor のイベントが\
   *   過去の gameTimeMs に紛れ込み履歴の行順序が決定順と食い違う、という事態を防ぐ
   * - commonGameTimeMs は記録した gameTimeMs の値まで進む (表示・スケジュール\
   *   プレビューの起点用、後退しない)
   *
   * @param payload gameTimeMs を除いたイベント本体
   * @param advanceTickMs クロックを進める量 (ms)
   */
  logEvent: <TEvent extends GameEvent>(
    payload: Omit<TEvent, 'gameTimeMs'>,
    advanceTickMs?: number,
  ) => TEvent
  /**
   * gameTimeMs を呼び出し側が確定した絶対値で指定してイベントを記録する
   *
   * - 複数 actor の tick を1バッチとして記録する際に使う。バッチ開始時点の\
   *   commonGameTimeMs を全 actor 共通の起点にすれば、同一 tickMs の actor は\
   *   同じ gameTimeMs になり履歴上1行にまとまる (`logEvent` の advanceTickMs 版は\
   *   呼び出す度に commonGameTimeMs を参照するため、同一バッチ内で逐次呼ぶと\
   *   後続の actor ほど値がずれてしまう)
   * - commonGameTimeMs は指定した gameTimeMs までしか進まない (後退しない)
   *
   * @param payload gameTimeMs を除いたイベント本体
   * @param gameTimeMs 確定済みの gameTimeMs
   */
  logEventAt: <TEvent extends GameEvent>(
    payload: Omit<TEvent, 'gameTimeMs'>,
    gameTimeMs: number,
  ) => TEvent
  /** 共通ゲームクロック・履歴を初期状態に戻す */
  reset: () => void
  /**
   * 実時間に対するゲーム内時間の進行倍率を設定する
   *
   * - 0 はポーズ相当 (auto 進行が実時間経過しても tick を消化しなくなる)
   *
   * @param timeScale 進行倍率
   */
  setTimeScale: (timeScale: number) => void
  /** 実時間に対するゲーム内時間の進行倍率。1 が等倍、0 はポーズ相当 */
  timeScale: number
}

export type GameClockStore = StoreApi<GameClockState>

/**
 * 共通ゲームクロックに乗るイベント種別の総称
 *
 * - 現状は `ActionLogEntry` のみ。Collision 等の別イベント種別を追加する際は\
 *   ここに Union で追加していく想定 (game-clock-store 自体の実装変更は不要)
 */
export type GameEvent = ActionLogEntry
