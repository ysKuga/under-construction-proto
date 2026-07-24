import { reducePointerState } from '../reduce-pointer-state'

test('idle 状態で mousedown すると pressed に遷移する', () => {
  expect(reducePointerState('idle', 'mousedown')).toEqual({
    nextState: 'pressed',
  })
})

test('pressed 状態で mouseup すると click 判定で idle に戻る', () => {
  expect(reducePointerState('pressed', 'mouseup')).toEqual({
    nextState: 'idle',
    resolved: 'click',
  })
})

test('pressed 状態で focusout すると pressed-blurred に遷移する', () => {
  expect(reducePointerState('pressed', 'focusout')).toEqual({
    nextState: 'pressed-blurred',
  })
})

test('pressed-blurred 状態で mouseup すると drop 判定で idle に戻る', () => {
  expect(reducePointerState('pressed-blurred', 'mouseup')).toEqual({
    nextState: 'idle',
    resolved: 'drop',
  })
})

test('pressed-blurred 状態で focus すると pressed に戻る', () => {
  expect(reducePointerState('pressed-blurred', 'focus')).toEqual({
    nextState: 'pressed',
  })
})

test.each([
  ['idle', 'mouseup'],
  ['idle', 'focus'],
  ['idle', 'focusout'],
  ['pressed', 'mousedown'],
  ['pressed', 'focus'],
  ['pressed-blurred', 'mousedown'],
  ['pressed-blurred', 'focusout'],
] as const)('%s 状態で %s は no-op (状態維持)', (state, event) => {
  expect(reducePointerState(state, event)).toEqual({ nextState: state })
})
