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
})
