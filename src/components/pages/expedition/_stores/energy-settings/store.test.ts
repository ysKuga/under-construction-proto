import { createEnergySettingsStore } from './store'

describe('createEnergySettingsStore', () => {
  it('既定の消費量は 1 で、setter で切り替わる', () => {
    const store = createEnergySettingsStore()

    expect(store.getState().consumePerMove).toBe(1)

    store.getState().setConsumePerMove(0)

    expect(store.getState().consumePerMove).toBe(0)
  })
})
