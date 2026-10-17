import { act, renderHook } from '@testing-library/react'

import { ENERGY_OUT_DELAY_MS } from '@/components/pages/find-path/_prototypes/_stores/energy/constants'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'

import { useEnergyOutAfterStop } from './use-energy-out-after-stop'

const renderAfterStop = () => {
  const energyOut = vi.fn<() => Promise<void>>(async () => {})
  const { result } = renderHook(
    () => ({
      dispatcher: useStage07EventDispatcher(),
      energyOutAfterStop: useEnergyOutAfterStop(PLAYER_ACTOR_ID, energyOut),
    }),
    { wrapper: Stage07EventProvider },
  )

  const moveStart = (actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['Stage07-move-start']({ actorId })
    })
  const moveStop = (actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['Stage07-move-stop']({ actorId })
    })
  const callEnergyOut = () => act(() => result.current.energyOutAfterStop())

  return { callEnergyOut, energyOut, moveStart, moveStop }
}

describe('useEnergyOutAfterStop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('移動中でなければそのまま energyOut を呼ぶ', async () => {
    const { callEnergyOut, energyOut } = renderAfterStop()

    await callEnergyOut()

    expect(energyOut).toHaveBeenCalledTimes(1)
  })

  it('移動中は保留し、停止の ENERGY_OUT_DELAY_MS 後に呼ぶ', async () => {
    const { callEnergyOut, energyOut, moveStart, moveStop } = renderAfterStop()

    await moveStart()
    await callEnergyOut()

    expect(energyOut).not.toHaveBeenCalled()

    await moveStop()
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS - 1))

    expect(energyOut).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))

    expect(energyOut).toHaveBeenCalledTimes(1)
  })

  it('保留が偶数回なら打ち消し合い呼ばない', async () => {
    const { callEnergyOut, energyOut, moveStart, moveStop } = renderAfterStop()

    await moveStart()
    await callEnergyOut()
    await callEnergyOut()
    await moveStop()
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS))

    expect(energyOut).not.toHaveBeenCalled()
  })

  it('停止後の待ち時間中に呼ばれた分も保留に含める', async () => {
    const { callEnergyOut, energyOut, moveStart, moveStop } = renderAfterStop()

    await moveStart()
    await callEnergyOut()
    await moveStop()
    await callEnergyOut()
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS))

    expect(energyOut).not.toHaveBeenCalled()
  })

  it('停止の二重通知でも 1 回だけ呼ぶ', async () => {
    const { callEnergyOut, energyOut, moveStart, moveStop } = renderAfterStop()

    await moveStart()
    await callEnergyOut()
    await moveStop()
    await moveStop()
    act(() => vi.advanceTimersByTime(ENERGY_OUT_DELAY_MS))

    expect(energyOut).toHaveBeenCalledTimes(1)
  })

  it('他の actor の移動は無視する', async () => {
    const { callEnergyOut, energyOut, moveStart } = renderAfterStop()

    await moveStart('mob-1')
    await callEnergyOut()

    expect(energyOut).toHaveBeenCalledTimes(1)
  })
})
