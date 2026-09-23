import { useEffect, useState } from 'react'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

/**
 * フェードアウト開始要求イベント名
 *
 * - 自動タイマー・外部からの明示的な dismiss 要求とも、この 1 本の経路で
 *   `phase` を 'leaving' へ倒す
 */
const NOTIFICATION_FADE_OUT_EVENT = 'Notification-fade-out'

/** 表示ライフサイクルの段階。位置・不透明度の CSS を切替える根拠にする */
export type NotificationPhase = 'entering' | 'leaving' | 'visible'

export type UseNotificationOptions = {
  /**
   * 自動でフェードアウトするか
   *
   * - 省略時: `autoDismissMs` が指定されていれば true 扱い、未指定なら false 扱い
   * - true かつ `autoDismissMs` 未指定時は既定値(`DEFAULT_AUTO_DISMISS_MS`)を使う
   */
  autoDismiss?: boolean
  /** 表示から自動でフェードアウトを開始するまでの時間(ms) */
  autoDismissMs?: number
  /** フェードアウトの transition 時間(ms)。省略時 200 */
  fadeOutMs?: number
}

export type UseNotificationReturn = {
  /** 表示ライフサイクルの段階 */
  phase: NotificationPhase
}

/** フェードアウトの既定 transition 時間(ms) */
const DEFAULT_FADE_OUT_MS = 200
/** `autoDismiss: true` かつ `autoDismissMs` 未指定時に使う既定の自動フェードアウト待機時間(ms) */
const DEFAULT_AUTO_DISMISS_MS = 1500

/**
 * 実効的な自動フェードアウト待機時間(ms)を解決する
 *
 * - `autoDismiss === false` → 自動フェードアウトしない(`undefined`)
 * - `autoDismiss` 省略 かつ `autoDismissMs` 省略 → 自動フェードアウトしない(`undefined`)
 * - 上記以外(`autoDismiss: true`、または `autoDismissMs` のみ指定)
 *   → `autoDismissMs` があればその値、無ければ `DEFAULT_AUTO_DISMISS_MS`
 */
const resolveAutoDismissMs = (
  autoDismiss: boolean | undefined,
  autoDismissMs: number | undefined,
): number | undefined => {
  if (autoDismiss === false) {
    return undefined
  }

  if (autoDismiss === undefined && autoDismissMs === undefined) {
    return undefined
  }

  return autoDismissMs ?? DEFAULT_AUTO_DISMISS_MS
}

/**
 * Notification 1件の表示ライフサイクル(entering → visible → leaving)を管理する
 *
 * - マウント直後は 'entering'。1フレーム後に 'visible' へ切替え transition を
 *   発火させ、右からのスライドインにする
 * - フェードアウトは `NOTIFICATION_FADE_OUT_EVENT` イベント経由でのみ開始する。
 *   `autoDismissMs` の自動タイマーもこのイベントを dispatch するだけで、将来
 *   外部から明示的に閉じたい場合も同じ経路を使える設計にしている
 * - フェードアウトの transition 完了(`fadeOutMs`)を待って `onDismiss` を呼ぶ
 *
 * @param id 対象 notification の id(`onDismiss` へそのまま渡す)
 * @param onDismiss フェードアウト完了時に呼ぶ(実際の除去は呼び出し側の責務)
 * @param options 自動フェードアウト・transition 時間の指定(省略可)
 */
export const useNotification = (
  id: string,
  onDismiss: (id: string) => void,
  options: UseNotificationOptions = {},
): UseNotificationReturn => {
  const {
    autoDismiss,
    autoDismissMs,
    fadeOutMs = DEFAULT_FADE_OUT_MS,
  } = options
  const resolvedAutoDismissMs = resolveAutoDismissMs(autoDismiss, autoDismissMs)

  const [phase, setPhase] = useState<NotificationPhase>('entering')
  const [eventTarget] = useState(() => new EventTarget())
  const dispatchEvent = useEventDispatcher(eventTarget)

  useEventListener(NOTIFICATION_FADE_OUT_EVENT, () => setPhase('leaving'), {
    target: eventTarget,
  })

  useEffect(() => {
    const enterHandle = requestAnimationFrame(() => setPhase('visible'))

    if (resolvedAutoDismissMs === undefined) {
      return () => cancelAnimationFrame(enterHandle)
    }

    const dismissHandle = setTimeout(() => {
      void dispatchEvent(NOTIFICATION_FADE_OUT_EVENT)
    }, resolvedAutoDismissMs)

    return () => {
      cancelAnimationFrame(enterHandle)
      clearTimeout(dismissHandle)
    }
  }, [resolvedAutoDismissMs, dispatchEvent])

  useEffect(() => {
    if (phase !== 'leaving') return

    const handle = setTimeout(() => onDismiss(id), fadeOutMs)

    return () => clearTimeout(handle)
  }, [phase, id, onDismiss, fadeOutMs])

  return { phase }
}
