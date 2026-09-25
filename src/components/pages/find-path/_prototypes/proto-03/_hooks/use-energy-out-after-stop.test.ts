import { act, renderHook } from '@testing-library/react'

import { ENERGY_OUT_DELAY_MS } from '@/components/pages/find-path/_prototypes/_stores/energy/constants'

import { useEnergyOutAfterStop } from './use-energy-out-after-stop'

const renderAfterStop = () => {
  const energyOut = vi.fn<() => Promise<void>>(async () => {})
  const { result } = renderHook(() => useEnergyOutAfterStop(energyOut))

  return { energyOut, result }
}

describe('useEnergyOutAfterStop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('移動中でなければそのまま energyOut を呼ぶ', async () => {
    const { energyOut, result } = renderAfterStop()

    await act(() => result.current.energyOutAfterStop())

    expect(energyOut).toHaveBeenCalledTimes(1)
  })

  it('移動中は保留し、停止の ENERGY_OUT_DELAY_MS 後に呼ぶ', async () => {
    const { energyOut, result } = renderAfterStop()

    act(() => result.current.notifyMoveStart())
    await act(() => result.current.energyOutAfterStop())

    expect(energyOut).not.toHaveBeenCalled()

    act(() => result.current.notifyMoveStop())
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS - 1))

    expect(energyOut).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))

    expect(energyOut).toHaveBeenCalledTimes(1)
  })

  it('保留が偶数回なら打ち消し合い呼ばない', async () => {
    const { energyOut, result } = renderAfterStop()

    act(() => result.current.notifyMoveStart())
    await act(() => result.current.energyOutAfterStop())
    await act(() => result.current.energyOutAfterStop())
    act(() => result.current.notifyMoveStop())
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS))

    expect(energyOut).not.toHaveBeenCalled()
  })

  it('停止後の待ち時間中に呼ばれた分も保留に含める', async () => {
    const { energyOut, result } = renderAfterStop()

    act(() => result.current.notifyMoveStart())
    await act(() => result.current.energyOutAfterStop())
    act(() => result.current.notifyMoveStop())
    await act(() => result.current.energyOutAfterStop())
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS))

    expect(energyOut).not.toHaveBeenCalled()
  })

  it('停止の二重通知でも 1 回だけ呼ぶ', async () => {
    const { energyOut, result } = renderAfterStop()

    act(() => result.current.notifyMoveStart())
    await act(() => result.current.energyOutAfterStop())
    act(() => result.current.notifyMoveStop())
    act(() => result.current.notifyMoveStop())
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS))

    expect(energyOut).toHaveBeenCalledTimes(1)
  })
})
