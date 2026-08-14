import { fireEvent, render, screen } from '@testing-library/react'

import { useActorSettingsStore } from '../_stores'
import { useTimeControl03Props } from '../index.contexts'
import { TimeControl03Providers } from '../index.providers'

vi.unmock('zustand')

test('zustand store の更新は useTimeControl03Props 消費側を再レンダリングさせない', () => {
  const propsRenderSpy = vi.fn()

  const PropsProbe = () => {
    const { actorIds } = useTimeControl03Props()

    propsRenderSpy()

    return <span data-testid="actor-count">{actorIds.length}</span>
  }

  const StoreUpdateButton = () => {
    const setProgressMode = useActorSettingsStore(
      (state) => state.setProgressMode,
    )

    return (
      <button onClick={() => setProgressMode('actor-a', 'manual')}>
        update store
      </button>
    )
  }

  render(
    <TimeControl03Providers actorIds={['actor-a']}>
      <PropsProbe />
      <StoreUpdateButton />
    </TimeControl03Providers>,
  )

  expect(propsRenderSpy).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByText('update store'))

  expect(propsRenderSpy).toHaveBeenCalledTimes(1)
})
