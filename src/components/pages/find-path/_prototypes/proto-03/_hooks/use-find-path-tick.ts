import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BehaviorSubject,
  mergeMap,
  range,
  scan,
  Subscription,
  takeWhile,
  timer,
  withLatestFrom,
} from 'rxjs'

import { useEnergyStoreApi } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { screenAngleToYaw } from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorNodeRegistry } from '@/prototypes/stage/stage-07/_contexts/actor-node-registry'
import {
  HexCell,
  hexDirectionToScreenAngle,
} from '@/prototypes/stage/stage-07/_lib/hex'
import { useGameClockStoreApi } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/path'
import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'
import { ActionLogEntry } from '@/prototypes/time-control/time-control-03/types'

import { isObstacleCell } from '../_lib/obstacle'
import { GOAL_POSITION, REALTIME_STEP_MS, TICK_MS } from '../constants'

import { toHexCell } from './use-planned-path-steps'

type UseFindPathTickOptions = {
  /** box-bot-01 の face action dispatcher(省略時は進行方向転換しない) */
  face?: (override: { rad: number }) => Promise<void>
  /**
   * 1 tick 消化ごとに移動先セルを通知する（省略可）
   *
   * - visibility registry の `markVisited` 等、tick 駆動から直接 `moveActor` を
   *   呼ぶ（クリックを介さない）ため、クリック時と同じ副作用をここで橋渡しする
   */
  onCellChange?: (cell: HexCell) => void
  /** box-bot-01 の walking action dispatcher(省略時は歩行モーション再生しない) */
  walking?: () => Promise<void>
}

type UseFindPathTickReturn = {
  /** 「実行」。予定経路を残り経路へコピーし、tick ループを開始する */
  execute: () => void
  /** tick ループが走行中か */
  isRunning: boolean
  /** bot が `GOAL_POSITION` に到達済みか */
  reachedGoal: boolean
}

/**
 * find-path proto-03（hex）の tick ドライバ（proto-01 `useFindPathTick` の hex 版）
 *
 * - proto-01 と異なり、予定経路は隣接セルのみ積める制約があるため区間距離は常に 1。
 *   距離比例の transition 時間算出（`segmentDurations`）は不要、tick 間隔は
 *   `TICK_MS` 固定でよい
 * - actor の現在セルは `ActorNodeRegistryProvider`（stage-07 版、`useState` ベース）が
 *   保持する。tick 計算中に最新セルを参照するため、`moveActor` 呼出直後に
 *   `currentCellRef` を自前更新する（state の再レンダリング反映待ちに依存しないため）
 *
 * @param options walking/face/onCellChange(いずれも省略可)
 */
export const useFindPathTick = (
  options: UseFindPathTickOptions = {},
): UseFindPathTickReturn => {
  const { face, onCellChange, walking } = options

  const gameClock = useGameClockStoreApi()
  const path = usePathStoreApi()
  const plannedPath = usePlannedPathStoreApi()
  const energy = useEnergyStoreApi()
  const { currentCell, moveActor } = useActorNodeRegistry()

  const [reachedGoal, setReachedGoal] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  /** 走行中の tick ループ */
  const subscriptionRef = useRef<null | Subscription>(null)
  /** 歩行 action の on/off 状態(トグル方式のため呼び出し側で追跡する) */
  const isWalkingRef = useRef(false)
  /** tick 計算中に参照する最新の現在セル */
  const currentCellRef = useRef(currentCell)
  /** 直近の carry 計算時刻 (`performance.now()`) */
  const lastTickTimeRef = useRef(0)

  /** timeScale の現在値を rx ストリームへ供給する橋渡し */
  const timeScale$ = useMemo(
    () => new BehaviorSubject(gameClock.getState().timeScale),
    [gameClock],
  )

  useEffect(() => {
    // game-clock の timeScale 変化を BehaviorSubject へ橋渡しする
    const unsubscribe = gameClock.subscribe((state) => {
      timeScale$.next(state.timeScale)
    })

    return unsubscribe
  }, [gameClock, timeScale$])

  useEffect(() => {
    // アンマウント時に走行中の tick ループを止める
    return () => subscriptionRef.current?.unsubscribe()
  }, [])

  /** path の次の 1 歩を消化する */
  const applyNextStep = useCallback(() => {
    const [next, ...rest] = path.getState().getPath(PLAYER_ACTOR_ID)

    if (!next) {
      return
    }

    gameClock.getState().logEvent<ActionLogEntry>(
      {
        actorId: PLAYER_ACTOR_ID,
        phase: rest.length === 0 ? 'resolution' : 'execution',
        target: next,
      },
      TICK_MS,
    )
    const target = toHexCell(next)
    const blocked = isObstacleCell(target)

    if (face) {
      const screenAngle = hexDirectionToScreenAngle(
        currentCellRef.current,
        target,
      )

      if (screenAngle !== undefined) {
        void face({ rad: screenAngleToYaw(screenAngle) })
      }
    }

    path.getState().setPath(PLAYER_ACTOR_ID, rest)

    if (!blocked) {
      moveActor(target)
      currentCellRef.current = target
      onCellChange?.(target)
    }

    energy.getState().consume(PLAYER_ACTOR_ID, 1)
    const outOfEnergy =
      energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current <= 0

    if (rest.length === 0 || outOfEnergy) {
      // 歩き切った、またはエネルギー切れでこれ以上進めない場合の終了処理（ゴール未達）
      if (outOfEnergy && rest.length > 0) {
        // 経路はまだ残っているがエネルギー切れのため打ち切る
        path.getState().setPath(PLAYER_ACTOR_ID, [])
      }

      plannedPath.getState().setPlannedPath(PLAYER_ACTOR_ID, [])
      setIsRunning(false)

      if (walking && isWalkingRef.current) {
        isWalkingRef.current = false
        void walking()
      }
    }

    if (
      !blocked &&
      target.q === GOAL_POSITION.q &&
      target.r === GOAL_POSITION.r
    ) {
      setReachedGoal(true)
    }
  }, [
    energy,
    gameClock,
    path,
    plannedPath,
    moveActor,
    face,
    walking,
    onCellChange,
  ])

  const execute = useCallback(() => {
    const planned = plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID)

    if (planned.length === 0) {
      return
    }

    // 予定経路を実行用の残り経路へコピー（planned-path 自体は歩き切るまで表示用に残す）
    path.getState().setPath(PLAYER_ACTOR_ID, planned)
    setReachedGoal(false)
    setIsRunning(true)
    currentCellRef.current = currentCell

    if (walking && !isWalkingRef.current) {
      isWalkingRef.current = true
      void walking()
    }

    subscriptionRef.current?.unsubscribe()

    /** path が枯渇したら tick ループを complete させる */
    const hasRemaining = () =>
      path.getState().getPath(PLAYER_ACTOR_ID).length > 0

    // isRunning の変更に伴う再レンダリングが重く、ここで直接 lastTickTimeRef を
    // 起算すると carry が過大に貯まり最初の複数 tick が一括消化されてしまう。
    // 次の描画フレーム後に起算しこの遅延を吸収する（proto-01 と同じ対策）
    requestAnimationFrame(() => {
      lastTickTimeRef.current = performance.now()

      subscriptionRef.current = timer(REALTIME_STEP_MS, REALTIME_STEP_MS)
        .pipe(
          // timeScale=0 の間は carry が増えず tick が出ない（ポーズ相当）
          withLatestFrom(timeScale$),
          // 実経過時間の持ち越し（carry）を貯め、TICK_MS 分たまるごとに 1 tick 発火する
          // （隣接セルのみ選択可のため区間距離は常に 1、proto-01 のような可変閾値は不要）
          scan(
            (acc, [, timeScale]) => {
              const now = performance.now()
              const elapsedMs = now - lastTickTimeRef.current

              lastTickTimeRef.current = now

              const carry = acc.carry + elapsedMs * timeScale
              const consumed = Math.floor(carry / TICK_MS)

              return { carry: carry - consumed * TICK_MS, consumed }
            },
            { carry: 0, consumed: 0 },
          ),
          takeWhile(hasRemaining),
          // 1 step で複数 tick 分（早送り時）を 1 つずつ流す
          mergeMap(({ consumed }) => range(0, consumed)),
        )
        .subscribe({
          next: () => applyNextStep(),
        })
    })
  }, [applyNextStep, currentCell, path, plannedPath, timeScale$, walking])

  return { execute, isRunning, reachedGoal }
}
