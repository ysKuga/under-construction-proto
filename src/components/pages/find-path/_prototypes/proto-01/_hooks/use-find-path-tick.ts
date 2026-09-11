import { useCallback, useEffect, useMemo, useRef } from 'react'
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

import { useActorNodeRegistry } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useGameClockStoreApi } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/path'
import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'
import { ActionLogEntry } from '@/prototypes/time-control/time-control-03/types'

import { REALTIME_STEP_MS, TICK_MS } from '../constants'

type UseFindPathTickReturn = {
  /**
   * 「実行」。予定経路を残り経路へコピーし、tick ループを開始する
   *
   * - 走行中に再度呼ぶと現在のループを止めて新しい予定経路で開始する
   * - 予定経路が空なら何もしない
   */
  execute: () => void
}

/**
 * find-path の tick ドライバ
 *
 * - tc-03 position store の `continueAuto`（手書き再帰 `setTimeout` + fixed-step
 *   accumulator + `timeScale` ポーリング）を rxjs へ移植したもの
 * - **r3f `useFrame`（実時間で毎フレーム描画補間する層）とは別レイヤー**。ここは
 *   論理時間 = tick を刻み、1 tick で bot を 1 セル進める。セル間の見た目の補間は
 *   `actors-layer` の CSS `transition` が担う
 * - 1 tick の処理: game-clock へ log → path を pop → `moveActor`（DOM 直書き、
 *   再レンダリングなし）
 */
export const useFindPathTick = (): UseFindPathTickReturn => {
  const gameClock = useGameClockStoreApi()
  const path = usePathStoreApi()
  const plannedPath = usePlannedPathStoreApi()
  const { moveActor } = useActorNodeRegistry()

  /** 走行中の tick ループ */
  const subscriptionRef = useRef<null | Subscription>(null)

  /**
   * timeScale の現在値を rx ストリームへ供給する橋渡し
   *
   * - game-clock store が唯一の真実。`subscribe` で BehaviorSubject へ流し込み、
   *   `withLatestFrom` が毎 step 参照する（`continueAuto` の `timeScale` ポーリング相当）
   */
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
    path.getState().setPath(PLAYER_ACTOR_ID, rest)
    moveActor(PLAYER_ACTOR_ID, { col: next.x, row: next.y })
  }, [gameClock, path, moveActor])

  const execute = useCallback(() => {
    const planned = plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID)

    if (planned.length === 0) {
      return
    }

    // 予定経路を実行用の残り経路へコピー（planned-path 自体は表示用に残す）
    path.getState().setPath(PLAYER_ACTOR_ID, planned)

    subscriptionRef.current?.unsubscribe()

    /** path が枯渇したら tick ループを complete させる */
    const hasRemaining = () =>
      path.getState().getPath(PLAYER_ACTOR_ID).length > 0

    subscriptionRef.current = timer(REALTIME_STEP_MS, REALTIME_STEP_MS)
      .pipe(
        // timeScale=0 の間は carry が増えず tick が出ない（ポーズ相当）
        withLatestFrom(timeScale$),
        // 実時間の持ち越し（carry）を貯め、TICK_MS を超えた分だけ tick を発火する
        scan(
          (acc, [, timeScale]) => {
            const carried = acc.carry + REALTIME_STEP_MS * timeScale
            const ticks = Math.floor(carried / TICK_MS)

            return { carry: carried - ticks * TICK_MS, ticks }
          },
          { carry: 0, ticks: 0 },
        ),
        // 1 step で複数 tick 分（早送り時）を 1 つずつ流す
        mergeMap(({ ticks }) => range(0, ticks)),
        takeWhile(hasRemaining),
      )
      .subscribe({ next: applyNextStep })
  }, [applyNextStep, path, plannedPath, timeScale$])

  return { execute }
}
