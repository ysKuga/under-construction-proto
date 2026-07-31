import { createStore, StoreApi } from 'zustand/vanilla'

import { getTickMs } from '../../time-control-02/_lib/get-tick-ms'
import { ActionLogEntry, ActorId, Position } from '../types'

import {
  ActorSettingsStore,
  DEFAULT_ACTOR_SETTINGS,
} from './actor-settings-store'
import { ActorStore, DEFAULT_ACTOR_INFO } from './actor-store'
import { GameClockStore } from './game-clock-store'
import { PathStore } from './path-store'

export type PositionState = {
  /** 行動決定。経路に沿って1tick分 (手動時) または最後まで (自動時) 進行する */
  dispatchAction: (actorId: ActorId) => void
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
 * @param actorStore 移動速度・tick 発生頻度 (`_stores/actor-store.ts`)
 * @param actorSettingsStore 行動進行モード (`_stores/actor-settings-store.ts`)
 * @param pathStore 残り移動経路 (`_stores/path-store.ts`)
 * @param gameClockStore 共通ゲームクロック・履歴ログ (`_stores/game-clock-store.ts`)
 */
export const createPositionStore = (
  actorStore: ActorStore,
  actorSettingsStore: ActorSettingsStore,
  pathStore: PathStore,
  gameClockStore: GameClockStore,
): PositionStore =>
  createStore<PositionState>((set) => ({
    ...INITIAL_STATE,
    dispatchAction: (actorId) => {
      const applyNextStep = () => {
        const [nextStep, ...rest] = pathStore.getState().pathById[actorId] ?? []

        if (!nextStep) {
          return
        }

        const tickRate =
          actorStore.getState().actorById[actorId]?.tickRate ??
          DEFAULT_ACTOR_INFO.tickRate
        const tickMs = getTickMs(tickRate)

        gameClockStore.getState().logEvent<ActionLogEntry>(
          {
            actorId,
            phase: rest.length === 0 ? 'resolution' : 'execution',
            target: nextStep,
          },
          tickMs,
        )
        pathStore.getState().setPath(actorId, rest)
        set((state) => ({
          positionById: { ...state.positionById, [actorId]: nextStep },
        }))
      }

      applyNextStep()

      const progressMode =
        actorSettingsStore.getState().settingsById[actorId]?.progressMode ??
        DEFAULT_ACTOR_SETTINGS.progressMode

      if (progressMode === 'auto') {
        const tickRate =
          actorStore.getState().actorById[actorId]?.tickRate ??
          DEFAULT_ACTOR_INFO.tickRate
        const tickMs = getTickMs(tickRate)

        const continueAuto = () => {
          if ((pathStore.getState().pathById[actorId] ?? []).length === 0) {
            return
          }

          applyNextStep()
          setTimeout(continueAuto, tickMs)
        }

        setTimeout(continueAuto, tickMs)
      }
    },
    reset: () => {
      set(INITIAL_STATE)
    },
  }))
