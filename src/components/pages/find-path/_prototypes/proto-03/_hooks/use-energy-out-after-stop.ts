import { useCallback, useEffect, useRef } from 'react'

import { ENERGY_OUT_DELAY_MS } from '@/components/pages/find-path/_prototypes/_stores/energy/constants'

type UseEnergyOutAfterStopReturn = {
  /**
   * 停止まで待つ energyOut（`useRegisterEnergyOut` へ渡す）
   *
   * - 移動中でなければそのまま `energyOut` を呼ぶ
   * - 移動中（停止後の待ち時間含む）は呼ばずに保留し、停止後にまとめて反映する
   */
  energyOutAfterStop: () => Promise<void>
  /** 移動の開始を伝える（現在地セル変更時に呼ぶ） */
  notifyMoveStart: () => void
  /**
   * 移動の停止を伝える（`Stage07` の `onMoveStop`）
   *
   * - 保留分があれば `ENERGY_OUT_DELAY_MS` 後に反映する（停止箇所でのタメ）
   * - 移動中でなければ何もしない（到着の二重通知で 2 回呼ばれても安全）
   */
  notifyMoveStop: () => void
}

/**
 * EN 切れ演出（`energyOut`）を actor の停止まで待たせる
 *
 * - EN は進入開始時に消費されるため、そのままでは移動時間が長いと歩いている途中で
 *   演出が始まる。EN の値・判定は変えず、演出の発火だけを停止箇所まで遅らせる
 * - `energyOut` は切替式（EN 切れ/回復で同じ action を呼ぶ）のため、保留した
 *   回数の偶奇で反映の要否を決める（偶数なら打ち消し合うため呼ばない）
 *
 * @param energyOut box-bot-01 の energyOut action dispatcher
 */
export const useEnergyOutAfterStop = (
  energyOut: () => Promise<void>,
): UseEnergyOutAfterStopReturn => {
  /** 移動中か */
  const isMovingRef = useRef(false)
  /** 移動中に呼ばれ保留した `energyOut` の回数 */
  const pendingCountRef = useRef(0)
  /** 停止後に保留分を反映するタイマー（待ち時間中のみ値を持つ） */
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  /** タイマーから最新の energyOut を読むための ref */
  const energyOutRef = useRef(energyOut)

  useEffect(() => {
    // 毎レンダー最新の energyOut を ref へ反映する(react-hooks/refs: render 中の書込み禁止)
    energyOutRef.current = energyOut
  })

  useEffect(() => {
    // unmount 時、待ち時間中のタイマーを止める
    return () => clearTimeout(timerRef.current)
  }, [])

  const energyOutAfterStop = useCallback(async () => {
    if (isMovingRef.current || timerRef.current !== undefined) {
      pendingCountRef.current += 1

      return
    }

    await energyOutRef.current()
  }, [])

  const notifyMoveStart = useCallback(() => {
    isMovingRef.current = true
  }, [])

  const notifyMoveStop = useCallback(() => {
    if (!isMovingRef.current) return

    isMovingRef.current = false

    if (pendingCountRef.current === 0) return

    timerRef.current = setTimeout(() => {
      timerRef.current = undefined

      // 待ち時間中に再び動き出した場合は、次の停止で反映する
      if (isMovingRef.current) return

      const shouldToggle = pendingCountRef.current % 2 === 1

      pendingCountRef.current = 0

      if (shouldToggle) void energyOutRef.current()
    }, ENERGY_OUT_DELAY_MS)
  }, [])

  return { energyOutAfterStop, notifyMoveStart, notifyMoveStop }
}
