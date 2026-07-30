import { createStore, StoreApi } from 'zustand/vanilla'

import { generateMovePath } from '../_lib/generate-move-path'
import { getTickMs } from '../_lib/get-tick-ms'
import {
  ActionLogEntry,
  ActorId,
  EventLog,
  MoveIntent,
  MovePath,
  Position,
  ProgressMode,
} from '../types'

export type ActorState = {
  /** 時系列の行動履歴 */
  actionLog: EventLog<ActionLogEntry>
  /** 行動決定。経路に沿って1tick分 (手動時) または最後まで (自動時) 進行する */
  dispatchAction: (actorId: ActorId) => void
  /** 移動企図。経路を生成するのみで position は更新しない */
  dispatchMoveIntent: (intent: MoveIntent) => void
  /** actor ごとの経路の最低 step 数 */
  minPathStepsById: Record<ActorId, number>
  /** actor ごとの残り移動経路 */
  movePathById: Record<ActorId, MovePath>
  /** actor ごとの現在位置。未移動の actor は含まれない */
  positionById: Record<ActorId, Position>
  /** actor ごとの行動進行モード */
  progressModeById: Record<ActorId, ProgressMode>
  /** 全 actor の状態を初期状態に戻す (実行中の auto タイマーは次回発火時に無害な no-op となる) */
  reset: () => void
  /** 経路の最低 step 数を設定する */
  setMinPathSteps: (actorId: ActorId, minSteps: number) => void
  /** 行動進行モードを設定する */
  setProgressMode: (actorId: ActorId, mode: ProgressMode) => void
  /** actor ごとの移動速度 (距離/ms) */
  speedById: Record<ActorId, number>
  /**
   * actor ごとの累積 tick 数 (gameTimeMs 算出用)
   *
   * - 企図 (dispatchMoveIntent) では リセットしない。複数回の企図・行動決定をまたいで\
   *   増え続ける絶対的なゲームクロックとして扱う (履歴が企図のたびに重複・上書きされないため)
   */
  tickCountById: Record<ActorId, number>
  /** actor ごとの tick 発生頻度。画面表示用の「敏捷性」とは別名にしている (未確定の変換式) */
  tickRateById: Record<ActorId, number>
}

export type ActorStore = StoreApi<ActorState>

/** 未移動 actor のデフォルト座標 */
export const DEFAULT_POSITION: Position = { x: 0, y: 0 }

/** 移動速度未設定 actor のデフォルト値 (距離/ms) */
export const DEFAULT_SPEED = 0.01

/** tick 発生頻度未設定 actor のデフォルト値 */
export const DEFAULT_TICK_RATE = 2

/** 経路の最低 step 数未設定 actor のデフォルト値 */
export const DEFAULT_MIN_PATH_STEPS = 1

/** 進行モード未設定 actor のデフォルト値 */
export const DEFAULT_PROGRESS_MODE: ProgressMode = 'auto'

/**
 * time-control-02 インスタンスごとに独立した store を生成する
 *
 * - 経路探索や PreAction/Outcome の割り込みは対象外 (stage-04 と同じスコープ)
 * - 移動は 企図 (Intent) → 経路生成 → 行動決定 (Execution、tick 刻み) → 事後 (Resolution) の\
 *   順で進行する。企図の時点では position を更新しない
 * - 経路の1tickあたりの移動距離は speed(距離/ms) と tickMs (tickRate から算出) の積で決まる
 * - dispatchAction は対象 actor の positionById/movePathById のみ更新するため、\
 *   他 actor の position を購読するコンポーネントは再レンダリングされない
 */
/** リセット時に戻す初期状態 */
const INITIAL_STATE = {
  actionLog: [],
  minPathStepsById: {},
  movePathById: {},
  positionById: {},
  progressModeById: {},
  speedById: {},
  tickCountById: {},
  tickRateById: {},
} satisfies Partial<ActorState>

export const createActorStore = (): ActorStore =>
  createStore<ActorState>((set, get) => ({
    ...INITIAL_STATE,
    dispatchAction: (actorId) => {
      const applyNextStep = () => {
        set((state) => {
          const [nextStep, ...rest] = state.movePathById[actorId] ?? []

          if (!nextStep) {
            return state
          }

          const tickCount = (state.tickCountById[actorId] ?? 0) + 1
          const tickMs = getTickMs(
            state.tickRateById[actorId] ?? DEFAULT_TICK_RATE,
          )

          return {
            actionLog: [
              ...state.actionLog,
              {
                event: {
                  actorId,
                  gameTimeMs: tickCount * tickMs,
                  phase: rest.length === 0 ? 'resolution' : 'execution',
                  target: nextStep,
                },
                time: Date.now(),
              },
            ],
            movePathById: { ...state.movePathById, [actorId]: rest },
            positionById: { ...state.positionById, [actorId]: nextStep },
            tickCountById: { ...state.tickCountById, [actorId]: tickCount },
          }
        })
      }

      applyNextStep()

      const mode = get().progressModeById[actorId] ?? DEFAULT_PROGRESS_MODE

      if (mode === 'auto') {
        const tickMs = getTickMs(
          get().tickRateById[actorId] ?? DEFAULT_TICK_RATE,
        )

        const continueAuto = () => {
          if ((get().movePathById[actorId] ?? []).length === 0) {
            return
          }

          applyNextStep()
          setTimeout(continueAuto, tickMs)
        }

        setTimeout(continueAuto, tickMs)
      }
    },
    dispatchMoveIntent: (intent) => {
      const { actorId, target } = intent

      set((state) => {
        const from = state.positionById[actorId] ?? DEFAULT_POSITION
        const speed = state.speedById[actorId] ?? DEFAULT_SPEED
        const tickMs = getTickMs(
          state.tickRateById[actorId] ?? DEFAULT_TICK_RATE,
        )
        const stepDistance = speed * tickMs
        const minSteps = Math.max(
          1,
          state.minPathStepsById[actorId] ?? DEFAULT_MIN_PATH_STEPS,
        )
        const path = generateMovePath(from, target, stepDistance, minSteps)
        const tickCount = state.tickCountById[actorId] ?? 0

        return {
          actionLog: [
            ...state.actionLog,
            {
              event: {
                actorId,
                gameTimeMs: tickCount * tickMs,
                phase: 'intent',
                target,
              },
              time: Date.now(),
            },
          ],
          movePathById: { ...state.movePathById, [actorId]: path },
        }
      })
    },
    reset: () => {
      set(INITIAL_STATE)
    },
    setMinPathSteps: (actorId, minSteps) => {
      set((state) => ({
        minPathStepsById: { ...state.minPathStepsById, [actorId]: minSteps },
      }))
    },
    setProgressMode: (actorId, mode) => {
      set((state) => ({
        progressModeById: { ...state.progressModeById, [actorId]: mode },
      }))
    },
  }))
