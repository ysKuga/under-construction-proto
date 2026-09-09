import { act, renderHook } from '@testing-library/react'

import { useCssToggle } from '../use-css-toggle'

/** checkboxRef へ実 input を紐づけた状態で hook を描画する */
const renderWithInput = () => {
  const input = document.createElement('input')
  input.type = 'checkbox'

  const utils = renderHook(() => {
    const cssToggle = useCssToggle()
    // ref を実 DOM へ差し込む(通常は JSX の ref 属性が行う)
    cssToggle.checkboxRef.current = input
    return cssToggle
  })

  return { ...utils, input }
}

test('set で checked を直書きする', () => {
  const { input, result } = renderWithInput()

  act(() => result.current.set(true))
  expect(input.checked).toBe(true)

  act(() => result.current.set(false))
  expect(input.checked).toBe(false)
})

test('toggle で checked を反転する', () => {
  const { input, result } = renderWithInput()

  act(() => result.current.toggle())
  expect(input.checked).toBe(true)

  act(() => result.current.toggle())
  expect(input.checked).toBe(false)
})

test('set / toggle で再レンダリングしない', () => {
  let renders = 0
  const input = document.createElement('input')
  input.type = 'checkbox'

  const { result } = renderHook(() => {
    renders += 1
    const cssToggle = useCssToggle()
    cssToggle.checkboxRef.current = input
    return cssToggle
  })

  expect(renders).toBe(1)

  act(() => result.current.set(true))
  act(() => result.current.toggle())

  expect(renders).toBe(1)
})
