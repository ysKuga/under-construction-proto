import { useCallback, useEffect, useRef } from 'react'

import { HexCell } from '../_lib/hex'

type UseFollowPathReturn = {
  /**
   * `path` に沿った自動移動を開始する(実行中なら中断して置き換える)
   *
   * - `path` は現在地セルを含まない、隣接セルの連なり(`findHexPath` の戻り値と同形)
   */
  followPath: (path: HexCell[]) => void
  /**
   * セル間移動アニメーション完了を伝える
   *
   * - 自動移動中(最終セルへの到着を含む)なら `true` を返す。呼び出し側は
   *   途中の到着で歩行を止めないよう、`true` の間は自身の到着処理を行わない
   * - 最終セルへの到着時に `onEnd()` を呼ぶ。`left`/`top` の `transitionend` で
   *   二重に呼ばれても 2 回目は `false` を返すだけで安全
   */
  notifyArrived: () => boolean
}

/**
 * 経路に沿った自動移動(1 マスずつの連続移動)を管理する
 *
 * - `moveDurationMs` 間隔のタイマーで 1 マスずつ `tryMove` を呼ぶ。到着
 *   (`transitionend`)を待たずに次へ進むため、途中で歩行が途切れない
 * - `tryMove` が `false`(EN 切れ等で進入不可)を返したらその場で停止し、
 *   `onEnd(進入できなかったセル)` を呼ぶ
 *
 * @param tryMove 隣接セルへの移動を試みる(`useHexMove` の `tryMove`)
 * @param moveDurationMs セル間移動アニメーションの所要時間(ms)。1 マスごとの間隔に使う
 * @param onEnd 自動移動の終了時。途中停止なら進入できなかったセルを渡す
 */
export const useFollowPath = (
  tryMove: (cell: HexCell) => boolean,
  moveDurationMs: number,
  onEnd: (blockedCell?: HexCell) => void,
): UseFollowPathReturn => {
  /** 未移動の残り経路 */
  const remainingRef = useRef<HexCell[]>([])
  /** 自動移動中か(最終セルへの到着待ちを含む) */
  const isFollowingRef = useRef(false)
  /** 次の 1 マスを進めるタイマー */
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  /** タイマーから最新の tryMove を読むための ref */
  const tryMoveRef = useRef(tryMove)
  /** タイマーから最新の moveDurationMs を読むための ref */
  const moveDurationMsRef = useRef(moveDurationMs)
  /** タイマー・到着通知から最新の onEnd を読むための ref */
  const onEndRef = useRef(onEnd)

  useEffect(() => {
    // 毎レンダー最新の tryMove/moveDurationMs/onEnd を ref へ反映する
    // (react-hooks/refs: render 中の書込み禁止)
    tryMoveRef.current = tryMove
    moveDurationMsRef.current = moveDurationMs
    onEndRef.current = onEnd
  })

  useEffect(() => {
    // unmount 時、進行中のタイマーを止める
    return () => clearTimeout(timerRef.current)
  }, [])

  const step = useCallback(function step() {
    const next = remainingRef.current.shift()

    if (!next) return

    if (!tryMoveRef.current(next)) {
      remainingRef.current = []
      isFollowingRef.current = false
      onEndRef.current(next)

      return
    }

    // 最後の 1 マスは到着(notifyArrived)で終了させるためタイマーを張らない
    if (remainingRef.current.length > 0) {
      timerRef.current = setTimeout(step, moveDurationMsRef.current)
    }
  }, [])

  const followPath = useCallback(
    (path: HexCell[]) => {
      clearTimeout(timerRef.current)

      if (path.length === 0) {
        isFollowingRef.current = false
        onEndRef.current()

        return
      }

      remainingRef.current = [...path]
      isFollowingRef.current = true
      step()
    },
    [step],
  )

  const notifyArrived = useCallback(() => {
    if (!isFollowingRef.current) return false
    if (remainingRef.current.length > 0) return true

    isFollowingRef.current = false
    onEndRef.current()

    return true
  }, [])

  return { followPath, notifyArrived }
}
