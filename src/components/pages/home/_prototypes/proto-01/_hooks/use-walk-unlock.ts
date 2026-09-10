import { useEffect } from 'react'
import { filter, fromEvent, map, scan, take } from 'rxjs'

import { ACTION_JUMP } from '@/components/samples/figure/box-bot'

/** 歩くボタンを解放するまでに必要なジャンプ回数 */
const JUMPS_TO_UNLOCK_WALK = 3

/**
 * ジャンプ回数のしきい値到達で「歩く」を解放する
 *
 * - `ACTION_JUMP`（box-bot の body/head クリックで発火）を購読し `scan` で数える
 * - 連番のカウントも解放フラグも React state に持たない。しきい値到達で `setUnlocked(true)` を\
 *   1 回呼ぶだけ（呼び先は hidden checkbox の checked を直書きする CSS state セル）。\
 *   解放前後どちらのクリックでも再レンダリングしない
 * - 一度解放したら `take(1)` で購読を完了する
 *
 * @param eventTarget box-bot と共有する EventTarget
 * @param setUnlocked しきい値到達時に `true` で呼ばれる。参照は安定である前提
 */
export const useWalkUnlock = (
  eventTarget: EventTarget,
  setUnlocked: (next: boolean) => void,
): void => {
  useEffect(() => {
    // ACTION_JUMP を数え、しきい値到達の 1 回だけ解放する
    const subscription = fromEvent(eventTarget, ACTION_JUMP)
      .pipe(
        scan((count) => count + 1, 0),
        map((count) => count >= JUMPS_TO_UNLOCK_WALK),
        filter(Boolean),
        take(1),
      )
      .subscribe(() => setUnlocked(true))

    return () => subscription.unsubscribe()
  }, [eventTarget, setUnlocked])
}
