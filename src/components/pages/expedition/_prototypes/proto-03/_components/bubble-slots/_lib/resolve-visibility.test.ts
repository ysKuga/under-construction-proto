import { resolveVisibility } from './resolve-visibility'

test('排他の指定がなければ表示条件のまま', () => {
  const result = resolveVisibility([{ id: 'a' }, { id: 'b' }], {
    a: true,
    b: false,
  })

  expect(result).toEqual({ a: true, b: false })
})

test('表示条件の未登録は非表示', () => {
  const result = resolveVisibility([{ id: 'a' }], {})

  expect(result).toEqual({ a: false })
})

test('表示中の吹き出しが hides に指定した種類を持つ吹き出しを隠す', () => {
  const result = resolveVisibility(
    [
      { id: 'waypoint', kinds: ['action'] },
      { id: 'execute', kinds: ['action', 'close'] },
      { hides: ['action'], id: 'depleted', kinds: ['rescue'] },
    ],
    { depleted: true, execute: true, waypoint: true },
  )

  expect(result).toEqual({ depleted: true, execute: false, waypoint: false })
})

test('hides を持つ吹き出しが非表示なら隠さない', () => {
  const result = resolveVisibility(
    [
      { id: 'waypoint', kinds: ['action'] },
      { hides: ['action'], id: 'depleted' },
    ],
    { depleted: false, waypoint: true },
  )

  expect(result).toEqual({ depleted: false, waypoint: true })
})

test('隠し合う指定では表示条件を満たす双方が非表示になる', () => {
  const result = resolveVisibility(
    [
      { hides: ['b'], id: 'a', kinds: ['a'] },
      { hides: ['a'], id: 'b', kinds: ['b'] },
    ],
    { a: true, b: true },
  )

  expect(result).toEqual({ a: false, b: false })
})
