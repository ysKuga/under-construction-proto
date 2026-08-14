import { render, renderHook, screen } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { createPropsContext } from '../create-props-context'

test('Provider 配下で useProps が渡した props を取得できる', () => {
  const { Provider, useProps } = createPropsContext<{ value: number }>('Test')

  const wrapper = (props: PropsWithChildren) => (
    <Provider value={1}>{props.children}</Provider>
  )

  const { result } = renderHook(() => useProps(), { wrapper })

  expect(result.current.value).toBe(1)
})

test('Provider 配下で children が描画される', () => {
  const { Provider } = createPropsContext<{ value: number }>('Test')

  render(
    <Provider value={1}>
      <p>child</p>
    </Provider>,
  )

  expect(screen.getByText('child')).toBeInTheDocument()
})

test('Provider 外で useProps を呼ぶと throw する', () => {
  const { useProps } = createPropsContext<{ value: number }>('Test')

  const Consumer = () => {
    useProps()
    return null
  }

  expect(() => render(<Consumer />)).toThrow(
    'useTestProps should be used within <TestProviders>',
  )
})
