import { act, fireEvent, renderHook } from '@testing-library/react'

import { useKeyLayer } from '@/hooks/use-key-layer'

import { useCloseOnEscape } from './use-close-on-escape'

/** ポップオーバーの開閉を知らせる `toggle` event を発行する */
const dispatchToggle = (popover: HTMLDivElement, newState: string) =>
  act(() => {
    popover.dispatchEvent(Object.assign(new Event('toggle'), { newState }))
  })

describe('useCloseOnEscape', () => {
  it('ポップオーバーが開いた後に積み、同じ描画で有効になった層より先に処理する', () => {
    const popover = document.createElement('div')
    const close = vi.fn<() => void>()
    const lower = vi.fn<() => void>()

    renderHook(() => {
      useCloseOnEscape({ current: popover }, close, false)
      // 親で同時に有効になる層（経路のキャンセル）。effect は子から親の順のため後に積まれる
      useKeyLayer('Escape', lower)
    })
    dispatchToggle(popover, 'open')
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(close).toHaveBeenCalledTimes(1)
    expect(lower).not.toHaveBeenCalled()
  })

  it('ブラウザが閉じたら close を呼び、以降は積まない', () => {
    const popover = document.createElement('div')
    const close = vi.fn<() => void>()

    renderHook(() => useCloseOnEscape({ current: popover }, close, false))
    dispatchToggle(popover, 'open')
    dispatchToggle(popover, 'closed')
    expect(close).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
  })
})
