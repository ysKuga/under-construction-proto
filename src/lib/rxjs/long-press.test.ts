import { TestScheduler } from 'rxjs/testing'

import { createLongPressStream } from './long-press'

/** 各テストで新しい仮想時間スケジューラを用意する */
const scheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
  })

/** 保持時間。marble の 1 フレーム = 1ms なので余裕を持たせた値にする */
const HOLD_MS = 30

test('holdMs 以内に解放すると tap のみ流れる', () => {
  scheduler().run(({ expectObservable, hot }) => {
    const down$ = hot('d')
    const up$ = hot('4ms u')

    const longPress$ = createLongPressStream(down$, up$, { holdMs: HOLD_MS })

    expectObservable(longPress$).toBe('4ms t', { t: 'tap' })
  })
})

test('holdMs 保持で start、その後の解放で end が流れる', () => {
  scheduler().run(({ expectObservable, hot }) => {
    const down$ = hot('d')
    const up$ = hot('50ms u')

    const longPress$ = createLongPressStream(down$, up$, { holdMs: HOLD_MS })

    expectObservable(longPress$).toBe('30ms s 19ms e', {
      e: 'end',
      s: 'start',
    })
  })
})

test('保持中に再度 down が来ると測り直す', () => {
  scheduler().run(({ expectObservable, hot }) => {
    // 1 回目 down(0ms) の 20ms 後に 2 回目 down、解放は 40ms
    const down$ = hot('d 19ms d')
    const up$ = hot('40ms u')

    const longPress$ = createLongPressStream(down$, up$, { holdMs: HOLD_MS })

    // 2 回目 down(20ms) 基準の window は 50ms まで。40ms の解放は tap 扱い
    expectObservable(longPress$).toBe('40ms t', { t: 'tap' })
  })
})

test('解放なしで down が連続しても測り直す', () => {
  scheduler().run(({ expectObservable, hot }) => {
    const down$ = hot('d 24ms d')
    const up$ = hot('')

    const longPress$ = createLongPressStream(down$, up$, { holdMs: HOLD_MS })

    // 2 回目 down(25ms) から holdMs 後の 55ms で start
    expectObservable(longPress$).toBe('55ms s', { s: 'start' })
  })
})
