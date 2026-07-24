import { PointerRawEventType, PointerState, PointerTransition } from './types'

const noop = (state: PointerState): PointerTransition => ({ nextState: state })

/**
 * click/drop 判定の遷移表
 *
 * - focusout を経ない mouseup は click、経た mouseup は drop と判定する
 * - focusout は「ポインタが元の要素から離れた」ことの代理指標として使う
 */
const transitions: Record<
  PointerState,
  Record<PointerRawEventType, (state: PointerState) => PointerTransition>
> = {
  idle: {
    focus: noop,
    focusout: noop,
    mousedown: () => ({ nextState: 'pressed' }),
    mouseup: noop,
  },
  pressed: {
    focus: noop,
    focusout: () => ({ nextState: 'pressed-blurred' }),
    mousedown: noop,
    mouseup: () => ({ nextState: 'idle', resolved: 'click' }),
  },
  'pressed-blurred': {
    focus: () => ({ nextState: 'pressed' }),
    focusout: noop,
    mousedown: noop,
    mouseup: () => ({ nextState: 'idle', resolved: 'drop' }),
  },
}

/**
 * 状態遷移を1ステップ進める
 *
 * @param state 現在の状態
 * @param event 受信した生イベント
 */
export const reducePointerState = (
  state: PointerState,
  event: PointerRawEventType,
): PointerTransition => transitions[state][event](state)
