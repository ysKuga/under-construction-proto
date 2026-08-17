import { shallow } from 'zustand/shallow'
import { createStore } from 'zustand/vanilla'

import { computeFitTransform } from '../_lib/stage-coords'
import { ActorSettingsStore, PlannedPathStore } from '../_stores/_types'
import { ActorId, Position } from '../types'

import { ComputedState, ComputedStore } from './types'

/**
 * @param actorIds 表示対象 actor 一覧 (props 由来)
 * @param actorSettingsStore 行動進行モード算出元
 * @param plannedPathStore stage transform (全 actor の目標地点の bounding box fit) 算出元
 */
export const createComputedStore = (
  actorIds: ActorId[],
  actorSettingsStore: ActorSettingsStore,
  plannedPathStore: PlannedPathStore,
): ComputedStore => {
  const getProgressMode = () =>
    actorSettingsStore.getState().getActorSettings(actorIds[0]).progressMode

  const getTargets = () => plannedPathStore.getState().getTargets(actorIds)

  let targets = getTargets()

  const store = createStore<ComputedState>(() => ({
    progressMode: getProgressMode(),
    stageTransform: computeFitTransform(targets),
  }))

  // actor-settings-store 変化時のみ再算出、値が変わった時のみ購読側へ通知する
  actorSettingsStore.subscribe(() => {
    const progressMode = getProgressMode()

    if (progressMode !== store.getState().progressMode) {
      store.setState({ progressMode })
    }
  })

  // targets (各 actor の目標地点) が実際に変化した時のみ再算出する
  plannedPathStore.subscribe(() => {
    const nextTargets = getTargets()

    if (shallow<Position[]>(nextTargets, targets)) {
      return
    }

    targets = nextTargets
    store.setState({ stageTransform: computeFitTransform(targets) })
  })

  return store
}
