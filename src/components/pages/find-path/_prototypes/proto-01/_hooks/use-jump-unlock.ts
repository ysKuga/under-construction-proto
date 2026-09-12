import { useEffect } from 'react'
import { filter, fromEvent, map, scan, take } from 'rxjs'

import { ACTION_JUMP } from '@/components/theater/figure/box-bot'

/** 「実行」を解放するまでに必要なジャンプ回数 */
const JUMPS_TO_UNLOCK_EXECUTE = 3

/**
 * ジャンプ回数のしきい値到達で「実行」を解放する
 *
 * - `ACTION_JUMP`（box-bot の body クリックで発火）を購読し `scan` で数える
 * - しきい値到達で `setUnlocked(true)` を 1 回呼ぶだけ。一度解放したら `take(1)` で
 *   購読を完了する（home proto-01 の `useWalkUnlock` と同型）
 *
 * @param eventTarget box-bot と共有する EventTarget
 * @param setUnlocked しきい値到達時に `true` で呼ばれる。参照は安定である前提
 */
export const useJumpUnlock = (
  eventTarget: EventTarget,
  setUnlocked: (next: boolean) => void,
): void => {
  useEffect(() => {
    // ACTION_JUMP を数え、しきい値到達の 1 回だけ解放する
    const subscription = fromEvent(eventTarget, ACTION_JUMP)
      .pipe(
        scan((count) => count + 1, 0),
        map((count) => count >= JUMPS_TO_UNLOCK_EXECUTE),
        filter(Boolean),
        take(1),
      )
      .subscribe(() => setUnlocked(true))

    return () => subscription.unsubscribe()
  }, [eventTarget, setUnlocked])
}
