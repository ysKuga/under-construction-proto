import { fireEvent, renderHook } from '@testing-library/react'

import { KeyLayerHandler, useKeyLayer } from '.'

const renderLayer = (
  handler: KeyLayerHandler,
  enabled = true,
  key = 'Escape',
) =>
  renderHook(
    (props: { enabled: boolean }) =>
      useKeyLayer(key, handler, { enabled: props.enabled }),
    { initialProps: { enabled } },
  )

describe('useKeyLayer', () => {
  it('最上位の層のみ処理する', () => {
    const lower = vi.fn<KeyLayerHandler>()
    const upper = vi.fn<KeyLayerHandler>()

    renderLayer(lower)
    renderLayer(upper)
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(upper).toHaveBeenCalledTimes(1)
    expect(lower).not.toHaveBeenCalled()
  })

  it('false を返すと下の層へ回す', () => {
    const lower = vi.fn<KeyLayerHandler>()
    const upper = vi.fn<KeyLayerHandler>(() => false)

    renderLayer(lower)
    renderLayer(upper)
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(upper).toHaveBeenCalledTimes(1)
    expect(lower).toHaveBeenCalledTimes(1)
  })

  it('unmount した層は外れ、下の層が処理する', () => {
    const lower = vi.fn<KeyLayerHandler>()
    const upper = vi.fn<KeyLayerHandler>()

    renderLayer(lower)
    renderLayer(upper).unmount()
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(upper).not.toHaveBeenCalled()
    expect(lower).toHaveBeenCalledTimes(1)
  })

  it('enabled が true になった時点で最上位へ積む', () => {
    const early = vi.fn<KeyLayerHandler>()
    const late = vi.fn<KeyLayerHandler>()

    const { rerender } = renderLayer(late, false)
    renderLayer(early)
    rerender({ enabled: true })
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(late).toHaveBeenCalledTimes(1)
    expect(early).not.toHaveBeenCalled()
  })

  it('handler 内で状態が変わっても 1 回の押下で処理するのは 1 層のみ', () => {
    const lower = vi.fn<KeyLayerHandler>()

    renderLayer(lower)
    const { unmount } = renderLayer(() => unmount())

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(lower).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(lower).toHaveBeenCalledTimes(1)
  })

  it('処理した押下は既定動作を止め、どの層も処理しなければ止めない', () => {
    renderLayer(() => {})
    const handled = new KeyboardEvent('keydown', {
      cancelable: true,
      key: 'Escape',
    })
    const unhandled = new KeyboardEvent('keydown', {
      cancelable: true,
      key: 'Enter',
    })

    window.dispatchEvent(handled)
    window.dispatchEvent(unhandled)

    expect(handled.defaultPrevented).toBe(true)
    expect(unhandled.defaultPrevented).toBe(false)
  })

  it('全ての層が false を返した押下は既定動作を止めない', () => {
    renderLayer(() => false)
    const event = new KeyboardEvent('keydown', {
      cancelable: true,
      key: 'Escape',
    })

    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('他のキー・IME 変換中の押下は扱わない', () => {
    const handler = vi.fn<KeyLayerHandler>()

    renderLayer(handler)
    fireEvent.keyDown(window, { key: 'Enter' })
    fireEvent.keyDown(window, { isComposing: true, key: 'Escape' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('key ごとに独立して積む', () => {
    const escape = vi.fn<KeyLayerHandler>()
    const tab = vi.fn<KeyLayerHandler>()

    renderLayer(escape)
    renderLayer(tab, true, 'Tab')
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(escape).toHaveBeenCalledTimes(1)
    expect(tab).not.toHaveBeenCalled()
  })
})
