import { act, render, renderHook, screen } from '@testing-library/react'

import { useCssToggle } from '../use-css-toggle'

/** hook を描画し、生成された checkbox を実 DOM へマウントした状態にする */
const renderWithCheckbox = (defaultChecked?: boolean) => {
  const { result } = renderHook(() => useCssToggle(defaultChecked))
  // checkbox 要素(ref 付き)を別ツリーへマウント → checkboxRef が実ノードを指す
  render(result.current.checkbox)
  // aria-hidden でアクセシビリティツリーから外れる → hidden: true で取得
  const input = screen.getByRole('checkbox', {
    hidden: true,
  }) as HTMLInputElement

  return { input, result }
}

test('set で checked を直書きする', () => {
  const { input, result } = renderWithCheckbox()

  act(() => result.current.set(true))
  expect(input.checked).toBe(true)

  act(() => result.current.set(false))
  expect(input.checked).toBe(false)
})

test('toggle で checked を反転する', () => {
  const { input, result } = renderWithCheckbox()

  act(() => result.current.toggle())
  expect(input.checked).toBe(true)

  act(() => result.current.toggle())
  expect(input.checked).toBe(false)
})

test('set / toggle で再レンダリングしない', () => {
  let renders = 0
  const { result } = renderHook(() => {
    renders += 1
    return useCssToggle()
  })

  expect(renders).toBe(1)

  act(() => result.current.set(true))
  act(() => result.current.toggle())

  expect(renders).toBe(1)
})

test('defaultChecked で初期 checked を指定する', () => {
  const { input } = renderWithCheckbox(true)

  expect(input.checked).toBe(true)
})
