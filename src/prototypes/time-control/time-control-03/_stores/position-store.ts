import { createStore, StoreApi } from 'zustand/vanilla'

import { getTickMs } from '../../time-control-02/_lib/get-tick-ms'
import { ActionLogEntry, ActorId, Position } from '../types'

import { DEFAULT_ACTOR_INFO, DEFAULT_ACTOR_SETTINGS } from './_constants'
import {
  ActorSettingsStore,
  ActorStore,
  GameClockStore,
  PathStore,
} from './_types'

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
  /** actor ごとの現在位置。未移動の actor は含まれない */
  positionById: Record<ActorId, Position>
  /** 現在位置を初期状態に戻す */
  reset: () => void
}

export type PositionStore = StoreApi<PositionState>

/** 未移動 actor のデフォルト座標 */
export const DEFAULT_POSITION: Position = { x: 0, y: 0 }

const INITIAL_STATE = {
  positionById: {},
} satisfies Partial<PositionState>

/**
 * @param actorStore 移動速度・tick 発生頻度 (`_stores/actor/store.ts`)
 * @param actorSettingsStore 行動進行モード (`_stores/actor-settings/store.ts`)
 * @param pathStore 残り移動経路 (`_stores/path/store.ts`)
 * @param gameClockStore 共通ゲームクロック・履歴ログ (`_stores/game-clock/store.ts`)
 */
export const createPositionStore = (
  actorStore: ActorStore,
  actorSettingsStore: ActorSettingsStore,
  pathStore: PathStore,
  gameClockStore: GameClockStore,
): PositionStore =>
  createStore<PositionState>((set) => {
    /**
     * 経路の次の1歩を進める
     *
     * - `baseTimeMs` 省略時は呼び出し毎に commonGameTimeMs を参照する (単一 actor の\
     *   逐次 tick 向け)
     * - `baseTimeMs` 指定時は `baseTimeMs + tickCount * tickMs` で gameTimeMs を確定する\
     *   (バッチ実行向け)。auto 進行中の2回目以降の tick は actor 毎に個別の setTimeout で\
     *   非同期発火するため、都度 commonGameTimeMs を参照する方式だと発火順序次第で\
     *   後続 actor の値がずれる。baseTimeMs 固定 + tickCount による絶対値計算にすることで\
     *   発火順序に依存せず、同一 tickMs の actor は常に同一 gameTimeMs になる
     */
    const applyNextStep = (
      actorId: ActorId,
      baseTimeMs?: number,
      tickCount = 1,
    ) => {
      const [nextStep, ...rest] = pathStore.getState().pathById[actorId] ?? []

      if (!nextStep) {
        return
      }

      const tickRate =
        actorStore.getState().actorById[actorId]?.tickRate ??
        DEFAULT_ACTOR_INFO.tickRate
      const tickMs = getTickMs(tickRate)
      const payload = {
        actorId,
        phase:
          rest.length === 0 ? ('resolution' as const) : ('execution' as const),
        target: nextStep,
      }

      if (baseTimeMs === undefined) {
        gameClockStore.getState().logEvent<ActionLogEntry>(payload, tickMs)
      } else {
        gameClockStore
          .getState()
          .logEventAt<ActionLogEntry>(payload, baseTimeMs + tickCount * tickMs)
      }

      pathStore.getState().setPath(actorId, rest)
      set((state) => ({
        positionById: { ...state.positionById, [actorId]: nextStep },
      }))
    }

    const startAutoIfNeeded = (actorId: ActorId, baseTimeMs?: number) => {
      const progressMode =
        actorSettingsStore.getState().settingsById[actorId]?.progressMode ??
        DEFAULT_ACTOR_SETTINGS.progressMode

      if (progressMode !== 'auto') {
        return
      }

      const tickRate =
        actorStore.getState().actorById[actorId]?.tickRate ??
        DEFAULT_ACTOR_INFO.tickRate
      const tickMs = getTickMs(tickRate)
      let tickCount = 1

      const continueAuto = () => {
        if ((pathStore.getState().pathById[actorId] ?? []).length === 0) {
          return
        }

        tickCount += 1
        applyNextStep(actorId, baseTimeMs, tickCount)
        setTimeout(continueAuto, tickMs)
      }

      setTimeout(continueAuto, tickMs)
    }

    return {
      ...INITIAL_STATE,
      dispatchAction: (actorId) => {
        applyNextStep(actorId)
        startAutoIfNeeded(actorId)
      },
      dispatchActions: (actorIds) => {
        const baseTimeMs = gameClockStore.getState().commonGameTimeMs

        actorIds.forEach((actorId) => applyNextStep(actorId, baseTimeMs, 1))
        actorIds.forEach((actorId) => startAutoIfNeeded(actorId, baseTimeMs))
      },
      reset: () => {
        set(INITIAL_STATE)
      },
    }
  })
