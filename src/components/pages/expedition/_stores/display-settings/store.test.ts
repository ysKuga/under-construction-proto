import { MOTION_DEFAULTS } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { createDisplaySettingsStore } from './store'

describe('createDisplaySettingsStore', () => {
  it('既定は散開・歩行モーション有効・向き同期なしで、setter で切り替わる', () => {
    const store = createDisplaySettingsStore()

    expect(store.getState().displayMode).toBe('scatter')
    expect(store.getState().enableWalking).toBe(true)
    expect(store.getState().syncStandaloneBotFacing).toBe(false)

    store.getState().setDisplayMode('fade')
    store.getState().setEnableWalking(false)
    store.getState().setSyncStandaloneBotFacing(true)

    expect(store.getState().displayMode).toBe('fade')
    expect(store.getState().enableWalking).toBe(false)
    expect(store.getState().syncStandaloneBotFacing).toBe(true)
  })

  it('移動・歩行の調整値は hex-stage の既定値で始まり、setter で切り替わる', () => {
    const store = createDisplaySettingsStore()

    expect(store.getState()).toMatchObject(MOTION_DEFAULTS)

    store.getState().setMoveDurationMs(1000)
    store.getState().setMaxWalkCycleSec(2)
    store.getState().setLegSwingAngle(0.8)
    store.getState().setBodyBobHeight(0.2)

    expect(store.getState()).toMatchObject({
      bodyBobHeight: 0.2,
      legSwingAngle: 0.8,
      maxWalkCycleSec: 2,
      moveDurationMs: 1000,
    })
  })
})
