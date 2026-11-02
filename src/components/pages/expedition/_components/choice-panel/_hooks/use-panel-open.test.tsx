import { act, renderHook } from '@testing-library/react'

import { ChoicePanelProps } from '../index.types'

import { usePanelOpen } from './use-panel-open'

/** 指定した数の選択肢 */
const choicesOf = (count: number): ChoicePanelProps['choices'] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${index}`,
    label: `${index}`,
    onSelect: () => {},
  }))

/** 指定した数の選択肢で usePanelOpen を描画する */
const renderPanelOpen = (count: number) =>
  renderHook((props: ChoicePanelProps) => usePanelOpen(props), {
    initialProps: { choices: choicesOf(count) },
  })

describe('usePanelOpen', () => {
  it('選択肢があれば開いた状態で始まる', () => {
    expect(renderPanelOpen(1).result.current.open).toBe(true)
    expect(renderPanelOpen(0).result.current.open).toBe(false)
  })

  it('選択肢が現れたら開き、無くなったら閉じる', () => {
    const { rerender, result } = renderPanelOpen(0)

    rerender({ choices: choicesOf(2) })
    expect(result.current.open).toBe(true)

    rerender({ choices: choicesOf(0) })
    expect(result.current.open).toBe(false)
  })

  it('選択肢の数が変わるだけでは、閉じたパネルを開き直さない', () => {
    const { rerender, result } = renderPanelOpen(1)

    act(() => result.current.close())
    rerender({ choices: choicesOf(2) })

    expect(result.current.open).toBe(false)
  })

  it('ピン留め中は選択肢が無くなっても閉じない', () => {
    const { rerender, result } = renderPanelOpen(1)

    act(() => result.current.handlePinClick())
    rerender({ choices: choicesOf(0) })

    expect(result.current.pinned).toBe(true)
    expect(result.current.open).toBe(true)
  })

  it('閉じるとピン留めも外れる', () => {
    const { result } = renderPanelOpen(1)

    act(() => result.current.handlePinClick())
    act(() => result.current.close())

    expect(result.current.pinned).toBe(false)
    expect(result.current.open).toBe(false)
  })

  it('選択肢が無くても呼び出しボタンで開ける', () => {
    const { result } = renderPanelOpen(0)

    act(() => result.current.toggle())

    expect(result.current.open).toBe(true)
  })
})
