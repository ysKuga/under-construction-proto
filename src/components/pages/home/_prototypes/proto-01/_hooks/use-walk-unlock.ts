import { useEffect, useState } from 'react'
import { filter, fromEvent, map, scan, take } from 'rxjs'

import { ACTION_JUMP } from '@/components/samples/figure/box-bot'

import type { UseProto01Return } from '../index.types'

/** 歩くボタンを解放するまでに必要なジャンプ回数 */
const JUMPS_TO_UNLOCK_WALK = 3

/**
 * ジャンプ回数のしきい値到達で「歩く」を解放する
 *
 * - `ACTION_JUMP`（box-bot の body/head クリックで発火）を購読し `scan` で数える
 * - 連番のカウントは state に持たず、`walkUnlocked` の `false → true` 1 回だけを state 化する。\
 *   解放前のクリックで再レンダリングしない
 * - 一度解放したら `take(1)` で購読を完了する
 *
 * @param eventTarget box-bot と共有する EventTarget
 */
export const useWalkUnlock = (
  eventTarget: EventTarget,
): Pick<UseProto01Return, 'walkUnlocked'> => {
  const [walkUnlocked, setWalkUnlocked] = useState(false)

  useEffect(() => {
    // ACTION_JUMP を数え、しきい値到達の 1 回だけ解放する
    const subscription = fromEvent(eventTarget, ACTION_JUMP)
      .pipe(
        scan((count) => count + 1, 0),
        map((count) => count >= JUMPS_TO_UNLOCK_WALK),
        filter(Boolean),
        take(1),
      )
      .subscribe(() => setWalkUnlocked(true))

    return () => subscription.unsubscribe()
  }, [eventTarget])

  return { walkUnlocked }
}
