import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { PropsWithChildren, useState } from 'react'

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

test('props が変化すると useProps 消費側に新しい値が反映される', () => {
  const { Provider, useProps } = createPropsContext<{ value: number }>('Test')

  const renderSpy = vi.fn<(value: number) => void>()

  const Consumer = () => {
    const { value } = useProps()

    renderSpy(value)

    return null
  }

  const Wrapper = () => {
    const [value, setValue] = useState(1)

    return (
      <>
        <button onClick={() => setValue((v) => v + 1)}>increment</button>
        <Provider value={value}>
          <Consumer />
        </Provider>
      </>
    )
  }

  render(<Wrapper />)

  expect(renderSpy).toHaveBeenLastCalledWith(1)

  fireEvent.click(screen.getByText('increment'))
  expect(renderSpy).toHaveBeenLastCalledWith(2)

  fireEvent.click(screen.getByText('increment'))
  expect(renderSpy).toHaveBeenLastCalledWith(3)

  expect(renderSpy).toHaveBeenCalledTimes(3)
})

test('Provider の値が変わらなくても、親の無関係な再レンダリングは消費側に伝播する', () => {
  // props をそのまま value に渡す実装でも、JSX は親の再レンダリング毎に\
  // 新しい props オブジェクトを生成するため、Provider 自身が再レンダリングされる\
  // 経路 (親の再レンダリング) では consumer への伝播を防げない。destructure 回避が\
  // 防ぐのは「Provider 自身が内部状態で独立に再レンダリングされる」場合のみ
  const { Provider, useProps } = createPropsContext<{ value: number }>('Test')

  const renderSpy = vi.fn<() => void>()

  const Consumer = () => {
    useProps()
    renderSpy()

    return null
  }

  const Wrapper = () => {
    const [, forceRerender] = useState(0)

    return (
      <>
        <button onClick={() => forceRerender((n) => n + 1)}>
          rerender parent
        </button>
        <Provider value={1}>
          <Consumer />
        </Provider>
      </>
    )
  }

  render(<Wrapper />)
  expect(renderSpy).toHaveBeenCalledTimes(1)

  fireEvent.click(screen.getByText('rerender parent'))
  expect(renderSpy).toHaveBeenCalledTimes(2)
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
