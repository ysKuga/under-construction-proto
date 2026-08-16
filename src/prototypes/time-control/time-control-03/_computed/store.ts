import { createStore } from 'zustand/vanilla'

import { ActorSettingsStore } from '../_stores/_types'
import { ActorId } from '../types'

import { ComputedState, ComputedStore } from './types'

/**
 * @param actorIds 表示対象 actor 一覧 (props 由来)
 * @param actorSettingsStore 行動進行モード算出元
 */
export const createComputedStore = (
  actorIds: ActorId[],
  actorSettingsStore: ActorSettingsStore,
): ComputedStore => {
  const getProgressMode = () =>
    actorSettingsStore.getState().getActorSettings(actorIds[0]).progressMode

  const store = createStore<ComputedState>(() => ({
    progressMode: getProgressMode(),
  }))

  // actor-settings-store 変化時のみ再算出、値が変わった時のみ購読側へ通知する
  actorSettingsStore.subscribe(() => {
    const progressMode = getProgressMode()

    if (progressMode !== store.getState().progressMode) {
      store.setState({ progressMode })
    }
  })

  return store
}
