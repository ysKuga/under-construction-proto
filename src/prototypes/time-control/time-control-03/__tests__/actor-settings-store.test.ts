import {
  createActorSettingsStore,
  DEFAULT_ACTOR_SETTINGS,
} from '../_stores/actor-settings'

test('未設定 actor の設定はデフォルト値', () => {
  const store = createActorSettingsStore()

  expect(store.getState().settingsById.a).toBeUndefined()
})

test('setFixedPathSteps は対象 actor の fixedPathSteps のみ更新する', () => {
  const store = createActorSettingsStore()

  store.getState().setFixedPathSteps('a', 3)

  expect(store.getState().settingsById.a).toEqual({
    ...DEFAULT_ACTOR_SETTINGS,
    fixedPathSteps: 3,
  })
})

test('setIsFixedPathSteps は対象 actor の isFixedPathSteps のみ更新する', () => {
  const store = createActorSettingsStore()

  store.getState().setFixedPathSteps('a', 3)
  store.getState().setIsFixedPathSteps('a', true)

  expect(store.getState().settingsById.a).toEqual({
    fixedPathSteps: 3,
    isFixedPathSteps: true,
    progressMode: 'auto',
  })
})

test('setProgressMode は対象 actor の progressMode のみ更新する', () => {
  const store = createActorSettingsStore()

  store.getState().setFixedPathSteps('a', 3)
  store.getState().setProgressMode('a', 'manual')

  expect(store.getState().settingsById.a).toEqual({
    fixedPathSteps: 3,
    isFixedPathSteps: false,
    progressMode: 'manual',
  })
})

test('reset で全 actor の設定が初期状態に戻る', () => {
  const store = createActorSettingsStore()

  store.getState().setFixedPathSteps('a', 3)
  store.getState().reset()

  expect(store.getState().settingsById).toEqual({})
})
