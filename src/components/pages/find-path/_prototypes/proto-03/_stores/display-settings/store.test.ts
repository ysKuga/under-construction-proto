import { createDisplaySettingsStore } from './store'

describe('createDisplaySettingsStore', () => {
  it('既定は散開・歩行モーション有効で、setter で切り替わる', () => {
    const store = createDisplaySettingsStore()

    expect(store.getState().displayMode).toBe('scatter')
    expect(store.getState().enableWalking).toBe(true)

    store.getState().setDisplayMode('fade')
    store.getState().setEnableWalking(false)

    expect(store.getState().displayMode).toBe('fade')
    expect(store.getState().enableWalking).toBe(false)
  })
})
