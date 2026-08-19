import { createActorSettingsStore } from '../_stores/actor-settings'
import { DEFAULT_ACTOR_SETTINGS } from '../_stores/actor-settings/constants'

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
    ...DEFAULT_ACTOR_SETTINGS,
    fixedPathSteps: 3,
    progressMode: 'manual',
  })
})

test('setFixedPathStepsAll は対象 actor 全員の fixedPathSteps を一括更新する', () => {
  const store = createActorSettingsStore()

  store.getState().setFixedPathStepsAll(['a', 'b'], 5)

  expect(store.getState().settingsById.a?.fixedPathSteps).toBe(5)
  expect(store.getState().settingsById.b?.fixedPathSteps).toBe(5)
})

test('setIsFixedPathStepsAll は対象 actor 全員の isFixedPathSteps を一括更新する', () => {
  const store = createActorSettingsStore()

  store.getState().setIsFixedPathStepsAll(['a', 'b'], false)

  expect(store.getState().settingsById.a?.isFixedPathSteps).toBe(false)
  expect(store.getState().settingsById.b?.isFixedPathSteps).toBe(false)
})

test('toggleProgressMode は対象 actor 全員の progressMode を一括反転する', () => {
  const store = createActorSettingsStore()

  store.getState().setProgressMode('a', 'manual')
  store.getState().toggleProgressMode(['a', 'b'])

  expect(store.getState().settingsById.a?.progressMode).toBe('auto')
  expect(store.getState().settingsById.b?.progressMode).toBe('auto')
})

test('reset で全 actor の設定が初期状態に戻る', () => {
  const store = createActorSettingsStore()

  store.getState().setFixedPathSteps('a', 3)
  store.getState().reset()

  expect(store.getState().settingsById).toEqual({})
})
