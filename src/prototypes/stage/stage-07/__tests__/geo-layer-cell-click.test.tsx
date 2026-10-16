import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GeoLayer } from '../_components/geo-layer'
import { Stage07EventProvider, useStage07EventListener } from '../_events'
import { HexCell } from '../_lib/hex'

/** `Stage07-cell-click` の発行を `onCellClickEvent` へ中継する */
const CellClickListener = (props: {
  onCellClickEvent: (cell: HexCell) => void
}) => {
  const { onCellClickEvent } = props

  useStage07EventListener('Stage07-cell-click', (event) =>
    onCellClickEvent(event.detail.cell),
  )

  return null
}

const renderGeoLayer = (
  onCellClickEvent: (cell: HexCell) => void,
  interactive: boolean,
) =>
  render(
    <Stage07EventProvider>
      <CellClickListener onCellClickEvent={onCellClickEvent} />
      <GeoLayer
        cols={2}
        hexSize={20}
        interactive={interactive}
        rows={1}
      />
    </Stage07EventProvider>,
  )

describe('GeoLayer の Stage07-cell-click 発行', () => {
  it('セルをクリックすると、そのセルを通知する', () => {
    const onCellClickEvent = vi.fn<(cell: HexCell) => void>()
    renderGeoLayer(onCellClickEvent, true)

    fireEvent.click(screen.getByRole('button', { name: 'hex 0-0' }))

    expect(onCellClickEvent).toHaveBeenCalledWith({ q: 0, r: 0 })
  })

  it('非対話のセルでは通知しない', () => {
    const onCellClickEvent = vi.fn<(cell: HexCell) => void>()
    const { container } = renderGeoLayer(onCellClickEvent, false)

    for (const cell of container.querySelectorAll('svg')) {
      fireEvent.click(cell)
    }

    expect(onCellClickEvent).not.toHaveBeenCalled()
  })
})
