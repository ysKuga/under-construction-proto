import { createStore } from 'zustand/vanilla'

import { getTickMs } from '../../../time-control-02/_lib/get-tick-ms'
import { ActionLogEntry, ActorId } from '../../types'
import { DEFAULT_ACTOR_INFO, DEFAULT_ACTOR_SETTINGS } from '../_constants'
import {
  ActorSettingsStore,
  ActorStore,
  GameClockStore,
  PathStore,
} from '../_types'

import { DEFAULT_POSITION } from './constants'
import { PositionState, PositionStore } from './types'

/**
 * auto 進行の tick 消化判定を行う実時間刻み (ms)
 *
 * - `timeScale` の変化はこの刻み単位でしか反映されない (最大 REALTIME_STEP_MS 分の遅延)。\
 *   tickMs (数百ms) 単位の反映より十分小さいため、fixed-step accumulator 方式の解像度として採用
 */
const REALTIME_STEP_MS = 10

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
  createStore<PositionState>((set, get) => {
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

      /**
       * REALTIME_STEP_MS 刻みで発火し、timeScale を都度反映しながら tick を消化する
       *
       * - accumulatedMs は「まだ tick 消化に使っていない、timeScale 適用後の経過時間」。\
       *   tickMs を超えた分だけ tick を消化し、余りを次回に持ち越す
       * - timeScale = 0 の間は accumulatedMs が増えないため、tick が消化されず自然に\
       *   停止する (ポーズ相当)
       *
       * @param accumulatedMs 直前の呼び出しからの持ち越し分
       */
      const continueAuto = (accumulatedMs: number) => {
        if ((pathStore.getState().pathById[actorId] ?? []).length === 0) {
          return
        }

        const timeScale = gameClockStore.getState().timeScale
        let nextAccumulatedMs = accumulatedMs + REALTIME_STEP_MS * timeScale

        while (nextAccumulatedMs >= tickMs) {
          tickCount += 1
          applyNextStep(actorId, baseTimeMs, tickCount)
          nextAccumulatedMs -= tickMs

          if ((pathStore.getState().pathById[actorId] ?? []).length === 0) {
            return
          }
        }

        setTimeout(() => continueAuto(nextAccumulatedMs), REALTIME_STEP_MS)
      }

      setTimeout(() => continueAuto(0), REALTIME_STEP_MS)
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
      getPosition: (actorId) => get().positionById[actorId] ?? DEFAULT_POSITION,
      reset: () => {
        set(INITIAL_STATE)
      },
    }
  })
