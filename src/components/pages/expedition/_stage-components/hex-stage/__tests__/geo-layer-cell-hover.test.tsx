import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PLAYER_ACTOR_ID } from '../constants'
import { GeoLayer } from '../_components/geo-layer'
import { HexStageEventProvider, useHexStageEventListener } from '../_events'
import { HexCell } from '../_lib/hex'
import { ActorsStoreProvider } from '../_stores/actors'

vi.unmock('zustand')

/** `HexStage-cell-hover` の発行を `onCellHover` へ中継する */
const CellHoverListener = (props: {
  onCellHover: (cell: HexCell | undefined) => void
}) => {
  const { onCellHover } = props

  useHexStageEventListener('HexStage-cell-hover', (event) =>
    onCellHover(event.detail.cell),
  )

  return null
}

const renderGeoLayer = (onCellHover: (cell: HexCell | undefined) => void) =>
  render(
    <ActorsStoreProvider initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}>
      <HexStageEventProvider>
        <CellHoverListener onCellHover={onCellHover} />
        <GeoLayer cols={2} hexSize={20} interactive rows={1} />
      </HexStageEventProvider>
    </ActorsStoreProvider>,
  )

describe('GeoLayer の HexStage-cell-hover 発行', () => {
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

  it('タッチで layer 外へ出ても解除せず、最後にタップしたセルを残す', () => {
    const onCellHover = vi.fn<(cell: HexCell | undefined) => void>()
    renderGeoLayer(onCellHover)

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'hex 0-0' }))
    // jsdom は PointerEvent 未実装で pointerType が落ちるため MouseEvent へ付与して代用
    const touchLeave = Object.assign(
      new MouseEvent('pointerout', { bubbles: true }),
      {
        pointerType: 'touch',
      },
    )
    fireEvent(
      screen.getByRole('button', { name: 'hex 0-0' }).parentElement as Element,
      touchLeave,
    )

    expect(onCellHover).toHaveBeenLastCalledWith({ q: 0, r: 0 })
  })

  it('event の Provider がなくても動作する', () => {
    render(
      <ActorsStoreProvider
        initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}
      >
        <GeoLayer cols={1} hexSize={20} interactive rows={1} />
      </ActorsStoreProvider>,
    )

    expect(() =>
      fireEvent.pointerEnter(screen.getByRole('button')),
    ).not.toThrow()
  })
})
