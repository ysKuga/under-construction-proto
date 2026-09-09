import {
  concat,
  map,
  mergeMap,
  type Observable,
  of,
  race,
  switchMap,
  take,
  timer,
} from 'rxjs'

/**
 * 長押し判定の結果イベント
 *
 * - `tap`: 保持時間未満で解放（通常クリック扱い）
 * - `start`: 保持時間に到達し長押し確定
 * - `end`: 長押し確定後の解放
 */
export type LongPressEvent = 'end' | 'start' | 'tap'

/**
 * 長押し判定の設定
 */
export type LongPressOptions = {
  /** 長押し確定までの保持時間（ms） */
  holdMs: number
}

/**
 * 押下 → 保持 → 解放の時系列から長押しを判定する Observable を作る
 *
 * - `down$` 発火後 `holdMs` 以内に `up$` → `tap`
 * - `down$` 発火後 `holdMs` 保持 → `start`、その後の最初の `up$` → `end`
 * - 保持中に `down$` が再発火した場合は進行中の判定を破棄して測り直す
 * - `up$` を伴わず次の `down$` が来るケースも測り直しで吸収する
 *
 * @param down$ 押下イベントの流れ
 * @param up$ 解放イベントの流れ
 * @param options 保持時間の設定
 */
export const createLongPressStream = (
  down$: Observable<unknown>,
  up$: Observable<unknown>,
  options: LongPressOptions,
): Observable<LongPressEvent> => {
  const { holdMs } = options

  return down$.pipe(
    switchMap(() =>
      race(
        // 解放が先: tap（同時刻なら race の先勝ちで tap を優先）
        up$.pipe(
          take(1),
          map((): LongPressEvent => 'tap'),
        ),
        // 保持時間到達が先: 長押し確定、その後の解放で end
        timer(holdMs).pipe(
          mergeMap(() =>
            concat(
              of<LongPressEvent>('start'),
              up$.pipe(
                take(1),
                map((): LongPressEvent => 'end'),
              ),
            ),
          ),
        ),
      ),
    ),
  )
}
