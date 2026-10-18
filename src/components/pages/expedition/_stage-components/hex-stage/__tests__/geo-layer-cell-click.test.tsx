import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PLAYER_ACTOR_ID } from '../constants'
import { GeoLayer } from '../_components/geo-layer'
import { HexStageEventProvider, useHexStageEventListener } from '../_events'
import { HexCell } from '../_lib/hex'
import { ActorsStoreProvider } from '../_stores/actors'

vi.unmock('zustand')

/** `HexStage-cell-click` の発行を `onCellClickEvent` へ中継する */
const CellClickListener = (props: {
  onCellClickEvent: (cell: HexCell) => void
}) => {
  const { onCellClickEvent } = props

  useHexStageEventListener('HexStage-cell-click', (event) =>
    onCellClickEvent(event.detail.cell),
  )

  return null
}

const renderGeoLayer = (
  onCellClickEvent: (cell: HexCell) => void,
  interactive: boolean,
) =>
  render(
    <ActorsStoreProvider initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}>
      <HexStageEventProvider>
        <CellClickListener onCellClickEvent={onCellClickEvent} />
        <GeoLayer cols={2} hexSize={20} interactive={interactive} rows={1} />
      </HexStageEventProvider>
    </ActorsStoreProvider>,
  )

describe('GeoLayer の選択可能表示', () => {
  it('現在セルのみ cursor: pointer を付けない', () => {
    renderGeoLayer(vi.fn(), true)

    expect(screen.getByRole('button', { name: 'hex 0-0' }).style.cursor).toBe(
      'default',
    )
    expect(screen.getByRole('button', { name: 'hex 1-0' }).style.cursor).toBe(
      'pointer',
    )
  })
})

describe('GeoLayer の HexStage-cell-click 発行', () => {
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
