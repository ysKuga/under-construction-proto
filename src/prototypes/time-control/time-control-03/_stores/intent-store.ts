import { createStore, StoreApi } from 'zustand/vanilla'

import { getTickMs } from '../../time-control-02/_lib/get-tick-ms'
import { generateMovePath } from '../_lib/generate-move-path'
import { ActionLogEntry, MoveIntent } from '../types'

import { ActorStore, DEFAULT_ACTOR_INFO } from './actor'
import { ActorSettingsStore, DEFAULT_ACTOR_SETTINGS } from './actor-settings'
import { GameClockStore } from './game-clock-store'
import { PathStore } from './path-store'
import { PlannedPathStore } from './planned-path-store'
import { DEFAULT_POSITION, PositionStore } from './position-store'

/** 状態を持たない操作専用 store。移動企図 (経路生成 → path-store への書き込み) のみを行う */
export type IntentState = {
  /** 移動企図。経路を生成するのみで position は更新しない */
  dispatchMoveIntent: (intent: MoveIntent) => void
}

export type IntentStore = StoreApi<IntentState>

/**
 * @param actorStore 移動速度・tick 発生頻度 (`_stores/actor/store.ts`)
 * @param actorSettingsStore 経路の最低 step 数 (`_stores/actor-settings/store.ts`)
 * @param pathStore 生成した経路の書き込み先 (`_stores/path-store.ts`)
 * @param plannedPathStore 予定位置表示用の経路の書き込み先 (`_stores/planned-path-store.ts`)
 * @param positionStore 企図元の現在位置 (`_stores/position-store.ts`)
 * @param gameClockStore 共通ゲームクロック・履歴ログ (`_stores/game-clock-store.ts`)
 */
export const createIntentStore = (
  actorStore: ActorStore,
  actorSettingsStore: ActorSettingsStore,
  pathStore: PathStore,
  plannedPathStore: PlannedPathStore,
  positionStore: PositionStore,
  gameClockStore: GameClockStore,
): IntentStore =>
  createStore<IntentState>(() => ({
    dispatchMoveIntent: (intent) => {
      const { actorId, target } = intent

      const from =
        positionStore.getState().positionById[actorId] ?? DEFAULT_POSITION
      const { speed, tickRate } =
        actorStore.getState().actorById[actorId] ?? DEFAULT_ACTOR_INFO
      const tickMs = getTickMs(tickRate)
      const stepDistance = speed * tickMs
      const settings =
        actorSettingsStore.getState().settingsById[actorId] ??
        DEFAULT_ACTOR_SETTINGS
      const fixedSteps = settings.isFixedPathSteps
        ? Math.max(1, settings.fixedPathSteps)
        : undefined
      const path = generateMovePath(from, target, stepDistance, fixedSteps)

      gameClockStore
        .getState()
        .logEvent<ActionLogEntry>({ actorId, phase: 'intent', target })
      pathStore.getState().setPath(actorId, path)
      plannedPathStore.getState().setPlannedPath(actorId, path)
    },
  }))
