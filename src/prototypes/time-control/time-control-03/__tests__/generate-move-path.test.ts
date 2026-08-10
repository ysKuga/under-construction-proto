import { generateMovePath } from '../_lib/generate-move-path'

test('distance が 0 の場合は空配列を返す', () => {
  expect(generateMovePath({ x: 1, y: 1 }, { x: 1, y: 1 }, 2)).toEqual([])
})

test('fixedSteps 未指定時、step数は distance / stepDistance の切り上げになる', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 3)

  expect(path).toHaveLength(4)
})

test('fixedSteps 未指定時、最終要素は target と一致する', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 7 }, 3)

  expect(path[path.length - 1]).toEqual({ x: 10, y: 7 })
})

test('fixedSteps 未指定時、最終 step 以外は stepDistance いっぱい移動する (端数を均等割りしない)', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 3)

  // 最終step以外 (3個): stepDistance(3)そのまま進む。最終stepのみ端数(1)
  expect(path[0]).toEqual({ x: 3, y: 0 })
  expect(path[1]).toEqual({ x: 6, y: 0 })
  expect(path[2]).toEqual({ x: 9, y: 0 })
  expect(path[3]).toEqual({ x: 10, y: 0 })
})

test('fixedSteps 指定時は距離基準の step 数より少なくても常にその値を使う', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 3, 2)

  expect(path).toEqual([
    { x: 3, y: 0 },
    { x: 6, y: 0 },
  ])
})

test('fixedSteps 指定時は距離基準の step 数より多くても常にその値を使い、target を超えうる', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 1, y: 0 }, 10, 4)

  expect(path).toEqual([
    { x: 10, y: 0 },
    { x: 20, y: 0 },
    { x: 30, y: 0 },
    { x: 40, y: 0 },
  ])
})

test('各 step は stepDistance 以下の距離で進む (fixedSteps 未指定時)', () => {
  const from = { x: 0, y: 0 }
  const stepDistance = 3
  const path = generateMovePath(from, { x: 10, y: 0 }, stepDistance)

  let previous = from
  for (const step of path) {
    const dx = step.x - previous.x
    const dy = step.y - previous.y
    const traveled = Math.sqrt(dx * dx + dy * dy)

    expect(traveled).toBeLessThanOrEqual(stepDistance + 1e-9)
    previous = step
  }
})
