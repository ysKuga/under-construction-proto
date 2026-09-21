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

import {
  isEnergyEventForActor,
  useEnergyEventDispatcher,
  useEnergyEventListener,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { screenAngleToYaw } from '@/components/theater/figure/box-bot'
import { useActorNodeRegistry } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { gridDirectionToScreenAngle } from '@/prototypes/stage/stage-06/_lib/direction'
import {
  CELL_TRANSITION_MS,
  PLAYER_ACTOR_ID,
} from '@/prototypes/stage/stage-06/constants'
import { useGameClockStoreApi } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/path'
import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'
import { ActionLogEntry } from '@/prototypes/time-control/time-control-03/types'

import { usePlannedPathCellRegistry } from '../_contexts/planned-path-cell-registry'
import { isObstacleCell } from '../_lib/obstacle'
import { useCarriedItemStoreApi } from '../_stores/carried-items'
import { useItemStoreApi } from '../_stores/items'
import { useTickStatusStoreApi } from '../_stores/tick-status'
import {
  ENERGY_OUT_DELAY_MS,
  GOAL_POSITION,
  REALTIME_STEP_MS,
  TICK_MS,
} from '../constants'

/**
 * 区間 `index` を消化するための待機時間 (ms)
 *
 * - 直前区間（`index - 1`）の transition 時間。直前の移動が完了してから次を
 *   開始するため。最初の区間（`index === 0`）は待機不要（即時消化）
 */
const thresholdForSegment = (durations: number[], index: number) =>
  index === 0 ? 0 : durations[index - 1]

type UseFindPathTickOptions = {
  /**
   * box-bot-01 の energyOut action dispatcher(省略時は EN 切れ演出を再生しない)
   *
   * - EN 消費（`Energy-consume` イベント dispatch）後、energy store 側の
   *   consume-listener が発行する `Energy-depleted` を購読してトグル発火する
   *   (直立 → へたり込み。issue #181、tick 側は消費の実処理・閾値判定を持たない)
   */
  energyOut?: () => Promise<void>
  /**
   * box-bot-01 の face action dispatcher(省略時は進行方向転換しない)
   *
   * - 1 tick 消化(1 マス移動)ごとに、移動元→移動先の方向を画面角度へ変換し
   *   `screenAngleToYaw` で yaw へ変換して dispatch する
   */
  face?: (override: { rad: number }) => Promise<void>
  /** box-bot-01 の walking action dispatcher(省略時は歩行モーション再生しない) */
  walking?: () => Promise<void>
  /**
   * box-bot-01 の walkingReset action dispatcher(省略時は歩行の脚・腕を即座に戻さない)
   *
   * - EN 切れ時、`walking`(トグル OFF)だけだと脚・腕が `settleRate`/`speedApproachRate`
   *   による自然減衰で戻る。角速度の減衰(`speedApproachRate`)が遅く、実測で 1 秒以上
   *   歩き続けて見えるため、`energyOut` の前傾と同時に「全体が傾いて見え、その後脚だけ
   *   垂直に戻る」演出崩れが起きる。`walkingReset`(引数省略で即時スナップ)を同時に
   *   呼び、脚・腕を即座に規定位置へ戻してから前傾させる
   */
  walkingReset?: (durationMs?: number) => Promise<void>
}

type UseFindPathTickReturn = {
  /**
   * 「実行」。予定経路を残り経路へコピーし、tick ループを開始する
   *
   * - 走行中に再度呼ぶと現在のループを止めて新しい予定経路で開始する
   * - 予定経路が空なら何もしない
   * - 途中の番号は到達ごとに 1 つずつフェードアウトし、歩き切ったら予定経路を\
   *   クリアする（番号の見た目も明示的にリセットする）
   * - 1 マス消化するごとにエネルギーを 1 消費し、0 になったらそこで打ち切る（ゴール未達）
   */
  execute: () => void
  /**
   * 携行中の回復アイテムを1つ使用する
   *
   * - 最古のものから消費し、その回復量ぶん EN を回復する。携行中アイテムが
   *   なければ何もしない
   */
  useCarriedItem: () => void
}

/**
 * find-path の tick ドライバ
 *
 * - tc-03 position store の `continueAuto`（手書き再帰 `setTimeout` + fixed-step
 *   accumulator + `timeScale` ポーリング）を rxjs へ移植したもの
 * - **r3f `useFrame`（実時間で毎フレーム描画補間する層）とは別レイヤー**。ここは
 *   論理時間 = tick を刻み、1 tick で bot を 1 セル進める。セル間の見た目の補間は
 *   `actors-layer` の CSS `transition` が担う
 * - tick の間隔は固定でなく、区間ごとの移動距離（斜めは √2 倍）から
 *   `actor-node-registry` の `moveActor` と同じ算出で可変にする。CSS transition の
 *   所要時間ぴったりで次 tick が発火するため、経路の継ぎ目で静止せず等速で動き続ける
 * - 1 tick の処理: game-clock へ log → path を pop → `moveActor`（DOM 直書き、
 *   再レンダリングなし）
 * - `isRunning`/`reachedGoal` は `TickStatusStore` で保持する。`useState` に持たせると
 *   値変更のたび呼び出し元（`FindPathContent`）配下ツリー全体（`Stage06` 含む）が
 *   再レンダリングされるため、選択購読可能な store へ分離した（issue #137）
 * - `options.walking`(省略可、box-bot-01 の walking action トグル dispatcher)を渡すと、
 *   「実行」開始で on、歩き切りで off にする。1 マスごとの隣接クリック移動(stage-07)と
 *   異なり、実行全体を 1 周期として on/off するため tick 単位のちらつきが起きない
 * - `options.face`(省略可、box-bot-01 の face action dispatcher)を渡すと、1 tick
 *   消化ごとに bot を進行方向へ向ける
 * - 回復アイテム（`ItemInstance.stock` 未指定）は踏んでも即時回復せず携行する
 *   （`CarriedItemStore`、上限に達していればその場に残る）。回復スポットは据置型
 *   のため対象外、従来通り即時回復。携行アイテムの使用は `useCarriedItem`（issue #181）
 * - EN 消費は `Energy-consume` イベントを dispatch するだけにし、実消費・0 以下の
 *   判定・`Energy-depleted` 発行は energy store 側の consume-listener
 *   （`_stores/energy/_events/_event-listeners/use-consume-energy-event-listener`）
 *   が担う（issue #181、tick 処理を box-bot action の直接呼出しから切り離す
 *   密結合解消のリファクタ）。tick 継続可否の判定自体は「読むだけ」のため対象外、
 *   引き続き `energy.getState().getEnergyInfo(...)` を直接読む
 * - `options.energyOut`(省略可、box-bot-01 の energyOut action dispatcher)は
 *   上記 `Energy-depleted` 購読でトグル発火(直立 → 予防姿勢)し、以後の回復発生時
 *   （回復スポット到達 or 携行アイテム使用 or `EnergyDebugPanel` の `+1`）に
 *   再度トグル発火して復帰させる。回復スポット/携行アイテムは直接 `recover` 呼出し
 *   後に呼び出し元で `outOfEnergyRef` を直接判定（回復側の呼出し経路自体は今回の
 *   リファクタ対象外）、`+1` は `Energy-recover` イベント経由のため recover-listener
 *   が発行する `Energy-recovered` を別途購読して同じ判定を行う。
 *   EN 切れ時の発火は `walkingReset` 実行後 `ENERGY_OUT_DELAY_MS` だけ遅らせる
 *   （演出上のタメ。脚は `walkingReset` で既にスナップ済みのため、遅延中に振れた
 *   まま残る心配はない）
 *
 * @param options walking/walkingReset/face/energyOut の dispatcher(いずれも省略可)
 */
export const useFindPathTick = (
  options: UseFindPathTickOptions = {},
): UseFindPathTickReturn => {
  const { energyOut, face, walking, walkingReset } = options

  const gameClock = useGameClockStoreApi()
  const path = usePathStoreApi()
  const plannedPath = usePlannedPathStoreApi()
  const energy = useEnergyStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const items = useItemStoreApi()
  const carriedItems = useCarriedItemStoreApi()
  const tickStatus = useTickStatusStoreApi()
  const { getActorPosition, moveActor } = useActorNodeRegistry()
  const { fadeOutCell, fadeOutStep, resetAllSteps } =
    usePlannedPathCellRegistry()

  /** 走行中の tick ループ */
  const subscriptionRef = useRef<null | Subscription>(null)
  /** 歩行 action の on/off 状態(トグル方式のため呼び出し側で追跡する) */
  const isWalkingRef = useRef(false)
  /**
   * EN 切れ演出(予防姿勢)が発火中か(トグル方式のため呼び出し側で追跡する)
   *
   * - EN 切れで `energyOut()` を dispatch した後 true。次に回復が発生した時点
   *   （直後の tick とは限らない。tick 停止後の再「実行」で回復アイテムのマスへ
   *   到達した場合も含む）で再度 dispatch して復帰させ、false へ戻す
   */
  const outOfEnergyRef = useRef(false)

  /** 消化済み tick 数。`execute` 開始時に 0 へ戻す。+1 が消化したセルの `order` と一致する */
  const consumedCountRef = useRef(0)

  /** 区間ごとの transition 時間 (ms)。`execute` 開始時に距離ベースで算出する */
  const segmentDurationsRef = useRef<number[]>([])
  /** 消化済み区間数。tick ループの carry 消化・`applyNextStep` 呼出しの両方が参照する */
  const segmentIndexRef = useRef(0)
  /**
   * 直近の carry 計算時刻 (`performance.now()`)
   *
   * - `REALTIME_STEP_MS` 固定加算だと、DOM 操作等でメインスレッドが一時的にブロックされ
   *   setInterval 発火が遅延・間引きされた際に carry 蓄積が実経過時間とズレる
   *   （区間 duration を短くしたことで誤差が体感できるレベルまで顕在化した）。
   *   実際の経過時間で加算し、このズレを避ける
   */
  const lastTickTimeRef = useRef(0)

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

  // Energy-depleted（energy store 側の consume-listener が EN 消費後に発行）を
  // 購読し、EN 切れ演出（energyOut）を発火する。walking off/walkingReset（下記
  // applyNextStep 側）より後に実行されても、setTimeout はマクロタスクのため
  // 演出タイミングは変わらない
  useEnergyEventListener('Energy-depleted', (event) => {
    if (
      !isEnergyEventForActor(event, PLAYER_ACTOR_ID) ||
      !energyOut ||
      outOfEnergyRef.current
    ) {
      return
    }

    outOfEnergyRef.current = true
    setTimeout(() => void energyOut(), ENERGY_OUT_DELAY_MS)
  })

  // Energy-recovered（energy store 側の recover-listener が EN 回復後に発行。
  // EnergyDebugPanel の +1 経由）を購読し、EN 切れ演出から復帰させる
  useEnergyEventListener('Energy-recovered', (event) => {
    if (
      !isEnergyEventForActor(event, PLAYER_ACTOR_ID) ||
      !energyOut ||
      !outOfEnergyRef.current
    ) {
      return
    }

    outOfEnergyRef.current = false
    void energyOut()
  })

  /** path の次の 1 歩を消化する */
  const applyNextStep = useCallback(() => {
    const [next, ...rest] = path.getState().getPath(PLAYER_ACTOR_ID)

    if (!next) {
      return
    }

    consumedCountRef.current += 1
    // 経路は常に先頭から順に消化されるため、消化済み数がそのまま
    // plannedPath 上の order（1 始まり）と一致する
    const order = consumedCountRef.current

    gameClock.getState().logEvent<ActionLogEntry>(
      {
        actorId: PLAYER_ACTOR_ID,
        phase: rest.length === 0 ? 'resolution' : 'execution',
        target: next,
      },
      TICK_MS,
    )
    const target = { col: next.x, row: next.y }
    const blocked = isObstacleCell(target)

    if (face) {
      const current = getActorPosition(PLAYER_ACTOR_ID)
      void face({
        rad: screenAngleToYaw(gridDirectionToScreenAngle(current, target)),
      })
    }

    path.getState().setPath(PLAYER_ACTOR_ID, rest)

    if (!blocked) {
      moveActor(PLAYER_ACTOR_ID, target)

      const item = items.getState().getItemAtCell(target)

      if (item && item.stock === undefined) {
        // 回復アイテム: 即時回復せず携行する。上限に達していればその場に残す
        if (carriedItems.getState().pickUp(item)) {
          items.getState().consumeItem(item.id)
        }
      } else if (item) {
        // 回復スポット（据置型）: 従来通り即時回復
        const consumed = items.getState().consumeItem(item.id)

        if (consumed) {
          energy.getState().recover(PLAYER_ACTOR_ID, consumed.amount)

          if (energyOut && outOfEnergyRef.current) {
            outOfEnergyRef.current = false
            void energyOut()
          }
        }
      }
    }

    // 消費自体は Energy-consume イベント経由（energy store 側の consume-listener が
    // 実処理・閾値判定を担う。EN 切れ演出発火は上記 Energy-depleted 購読側で行う）
    void energyDispatch['Energy-consume']({
      actorId: PLAYER_ACTOR_ID,
      amount: 1,
    })
    const outOfEnergy =
      energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current <= 0

    if (rest.length === 0 || outOfEnergy) {
      // 歩き切った、またはエネルギー切れでこれ以上進めない場合の終了処理（ゴール未達）。
      // fadeOutStep 済みの番号は resetAllSteps で明示的に戻す
      if (outOfEnergy && rest.length > 0) {
        // 経路はまだ残っているがエネルギー切れのため打ち切る
        path.getState().setPath(PLAYER_ACTOR_ID, [])
      }

      plannedPath.getState().setPlannedPath(PLAYER_ACTOR_ID, [])
      resetAllSteps()
      tickStatus.getState().setIsRunning(false)

      if (walking && isWalkingRef.current) {
        isWalkingRef.current = false
        void walking()
        // walking OFF の自然減衰(角速度の approach)は 1 秒以上かかり、EN 切れ演出の
        // 前傾と同時進行すると脚がまだ振れたまま見える。即座にスナップさせる
        void walkingReset?.()
      }
    } else {
      // 同じセルが経路上でまだ後に残っていれば、その番号を最前面へ昇格させる。
      // 残っていなければ通常のフェードアウトのみ
      const remainingOccurrences = rest.filter(
        (step) => step.x === next.x && step.y === next.y,
      ).length
      const nextIndexInRest = rest.findIndex(
        (step) => step.x === next.x && step.y === next.y,
      )
      const promoteOrder =
        nextIndexInRest === -1 ? undefined : order + 1 + nextIndexInRest
      // 昇格後の重なりが残り 1 枚（＝もうこれ以降同じセルは出てこない）なら
      // 半透明に戻す。2 枚以上残っていれば不透明のまま
      const promoteAsLast = remainingOccurrences === 1

      fadeOutStep(order, promoteOrder, promoteAsLast)

      if (remainingOccurrences === 0) {
        // このセルの最後の番号だった（list variant のセル背景・枠線も戻す）
        fadeOutCell({ col: next.x, row: next.y })
      }
    }

    if (
      !blocked &&
      next.x === GOAL_POSITION.col &&
      next.y === GOAL_POSITION.row
    ) {
      tickStatus.getState().setReachedGoal(true)
    }
  }, [
    energy,
    energyDispatch,
    gameClock,
    items,
    carriedItems,
    path,
    plannedPath,
    tickStatus,
    fadeOutCell,
    fadeOutStep,
    resetAllSteps,
    moveActor,
    getActorPosition,
    energyOut,
    face,
    walking,
    walkingReset,
  ])

  const execute = useCallback(() => {
    const planned = plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID)

    if (planned.length === 0) {
      return
    }

    // 予定経路を実行用の残り経路へコピー（planned-path 自体は歩き切るまで表示用に残す）
    path.getState().setPath(PLAYER_ACTOR_ID, planned)
    tickStatus.getState().setReachedGoal(false)
    tickStatus.getState().setIsRunning(true)
    consumedCountRef.current = 0
    segmentIndexRef.current = 0

    // 区間ごとの移動距離（斜めは √2 倍）から transition 時間を算出する。
    // `moveActor` 側と同じ基準（distance * CELL_TRANSITION_MS）にし、tick 発火の
    // タイミングを実際の見た目のアニメーション所要時間へ一致させる
    const start = getActorPosition(PLAYER_ACTOR_ID)
    const points = [
      start,
      ...planned.map((step) => ({ col: step.x, row: step.y })),
    ]

    segmentDurationsRef.current = points.slice(1).map((point, index) => {
      const prev = points[index]
      const distance = Math.hypot(point.col - prev.col, point.row - prev.row)

      return distance * CELL_TRANSITION_MS
    })

    if (walking && !isWalkingRef.current) {
      isWalkingRef.current = true
      void walking()
    }

    subscriptionRef.current?.unsubscribe()

    /** path が枯渇したら tick ループを complete させる */
    const hasRemaining = () =>
      path.getState().getPath(PLAYER_ACTOR_ID).length > 0

    // isRunning の変更に伴う再レンダリング（design.md 懸念・リスク）が重く、ここで
    // 直接 lastTickTimeRef を起算すると carry が過大に貯まり最初の複数区間が一括消化
    // されてしまう。次の描画フレーム後に起算しこの遅延を吸収する
    requestAnimationFrame(() => {
      lastTickTimeRef.current = performance.now()

      subscriptionRef.current = timer(REALTIME_STEP_MS, REALTIME_STEP_MS)
        .pipe(
          // timeScale=0 の間は carry が増えず tick が出ない（ポーズ相当）
          withLatestFrom(timeScale$),
          // 実経過時間の持ち越し（carry）を貯め、直前区間の transition 時間が
          // 経過した分だけ tick を発火する（区間距離に応じ閾値が可変。最初の区間は
          // 待機なしで即時消化する）
          scan(
            (acc, [, timeScale]) => {
              const now = performance.now()
              const elapsedMs = now - lastTickTimeRef.current

              lastTickTimeRef.current = now

              if (timeScale === 0) {
                // carry を増やさないだけでは、最初の区間（閾値 0、待機なし即時消化）が
                // carry=0 のままでも消化されてしまう。ポーズ中は tick 自体を出さない
                return { carry: acc.carry, consumed: 0 }
              }

              let carry = acc.carry + elapsedMs * timeScale
              let consumed = 0

              while (
                segmentIndexRef.current + consumed <
                  segmentDurationsRef.current.length &&
                carry >=
                  thresholdForSegment(
                    segmentDurationsRef.current,
                    segmentIndexRef.current + consumed,
                  )
              ) {
                const threshold = thresholdForSegment(
                  segmentDurationsRef.current,
                  segmentIndexRef.current + consumed,
                )

                // 閾値 0（最初の区間、待機なし即時消化）の場合、carry は消化に使われて
                // いない。そのまま持ち越すと次区間の待機時間にその分食い込んでしまう
                // ため 0 にリセットする
                carry = threshold === 0 ? 0 : carry - threshold
                consumed += 1
              }

              return { carry, consumed }
            },
            { carry: 0, consumed: 0 },
          ),
          // consumed=0 の tick は mergeMap で何も emit されず takeWhile が評価されない
          // ため、pathが空になった後も判定されずストリームが残り続けてしまう。
          // scan 直後（毎 tick 必ず評価される位置）に置く
          takeWhile(hasRemaining),
          // 1 step で複数区間分（早送り時）を 1 つずつ流す
          mergeMap(({ consumed }) => range(0, consumed)),
        )
        .subscribe({
          next: () => {
            applyNextStep()
            segmentIndexRef.current += 1
          },
        })
    })
  }, [
    applyNextStep,
    getActorPosition,
    path,
    plannedPath,
    tickStatus,
    timeScale$,
    walking,
  ])

  const useCarriedItem = useCallback(() => {
    const item = carriedItems.getState().useItem()

    if (item) {
      energy.getState().recover(PLAYER_ACTOR_ID, item.amount)

      if (energyOut && outOfEnergyRef.current) {
        outOfEnergyRef.current = false
        void energyOut()
      }
    }
  }, [carriedItems, energy, energyOut])

  return { execute, useCarriedItem }
}
