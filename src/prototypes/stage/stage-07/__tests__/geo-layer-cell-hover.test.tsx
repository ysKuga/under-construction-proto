import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GeoLayer } from '../_components/geo-layer'
import { Stage07EventProvider, useStage07EventListener } from '../_events'
import { HexCell } from '../_lib/hex'

/** `Stage07-cell-hover` の発行を `onCellHover` へ中継する */
const CellHoverListener = (props: {
  onCellHover: (cell: HexCell | undefined) => void
}) => {
  const { onCellHover } = props

  useStage07EventListener('Stage07-cell-hover', (event) =>
    onCellHover(event.detail.cell),
  )

  return null
}

const renderGeoLayer = (onCellHover: (cell: HexCell | undefined) => void) =>
  render(
    <Stage07EventProvider>
      <CellHoverListener onCellHover={onCellHover} />
      <GeoLayer
        cols={2}
        hexSize={20}
        interactive
        onCellClick={() => {}}
        rows={1}
      />
    </Stage07EventProvider>,
  )

describe('GeoLayer の Stage07-cell-hover 発行', () => {
  it('セルへ入ると、そのセルを通知する', () => {
    const onCellHover = vi.fn<(cell: HexCell | undefined) => void>()
    renderGeoLayer(onCellHover)

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'hex 0-0' }))

    expect(onCellHover).toHaveBeenLastCalledWith({ q: 0, r: 0 })
  })

  it('セル間の移動では解除を挟まず、移動先のセルのみ通知する', () => {
    const onCellHover = vi.fn<(cell: HexCell | undefined) => void>()
    renderGeoLayer(onCellHover)
    const [first, second] = screen.getAllByRole('button')

    fireEvent.pointerEnter(first)
    // jsdom は PointerEvent 未実装で relatedTarget が落ちるため MouseEvent で代用
    first.dispatchEvent(
      new MouseEvent('pointerout', { bubbles: true, relatedTarget: second }),
    )
    fireEvent.pointerEnter(second)

    expect(onCellHover.mock.calls.map(([cell]) => cell)).not.toContain(
      undefined,
    )
  })

  it('layer 外へ出ると、hover 解除（undefined）を通知する', () => {
    const onCellHover = vi.fn<(cell: HexCell | undefined) => void>()
    renderGeoLayer(onCellHover)

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'hex 0-0' }))
    fireEvent.pointerLeave(
      screen.getByRole('button', { name: 'hex 0-0' }).parentElement as Element,
    )

    expect(onCellHover).toHaveBeenLastCalledWith(undefined)
  })

  it('Provider がなくても動作する', () => {
    render(
      <GeoLayer
        cols={1}
        hexSize={20}
        interactive
        onCellClick={() => {}}
        rows={1}
      />,
    )

    expect(() =>
      fireEvent.pointerEnter(screen.getByRole('button')),
    ).not.toThrow()
  })
})
