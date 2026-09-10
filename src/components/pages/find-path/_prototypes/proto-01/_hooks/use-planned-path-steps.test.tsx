import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { FindPathStoresProvider } from '../_contexts/find-path-stores'

import { usePlannedPathSteps } from './use-planned-path-steps'

const ACTOR_ID = 'player'

const wrapper = ({ children }: PropsWithChildren) => (
  <FindPathStoresProvider>{children}</FindPathStoresProvider>
)

/** wrapper hook と planned-path store の生 API を同じ Provider 下で取得する */
const renderSteps = () =>
  renderHook(
    () => ({
      api: usePlannedPathStoreApi(),
      steps: usePlannedPathSteps(ACTOR_ID),
    }),
    { wrapper },
  )

const plannedOf = (result: ReturnType<typeof renderSteps>['result']) =>
  result.current.api.getState().getPlannedPath(ACTOR_ID)

test('appendStep はセルを Position へ載せ替えて末尾に積む', () => {
  const { result } = renderSteps()

  act(() => result.current.steps.appendStep({ col: 1, row: 0 }))
  act(() => result.current.steps.appendStep({ col: 2, row: 1 }))

  expect(plannedOf(result)).toEqual([
    { x: 1, y: 0 },
    { x: 2, y: 1 },
  ])
})

test('popStep は末尾のセルだけ取り消す', () => {
  const { result } = renderSteps()

  act(() => result.current.steps.appendStep({ col: 1, row: 0 }))
  act(() => result.current.steps.appendStep({ col: 2, row: 1 }))
  act(() => result.current.steps.popStep())

  expect(plannedOf(result)).toEqual([{ x: 1, y: 0 }])
})

test('空の予定経路で popStep しても無処理（例外なし）', () => {
  const { result } = renderSteps()

  act(() => result.current.steps.popStep())

  expect(plannedOf(result)).toEqual([])
})

test('他 actor の予定経路は変更しない', () => {
  const { result } = renderSteps()

  act(() => {
    result.current.api.getState().setPlannedPath('other', [{ x: 9, y: 9 }])
  })
  act(() => result.current.steps.appendStep({ col: 1, row: 0 }))

  expect(result.current.api.getState().getPlannedPath('other')).toEqual([
    { x: 9, y: 9 },
  ])
})
