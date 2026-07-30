import { generateMovePath } from '../_lib/generate-move-path'

test('distance が 0 の場合は空配列を返す', () => {
  expect(generateMovePath({ x: 1, y: 1 }, { x: 1, y: 1 }, 2)).toEqual([])
})

test('step数は distance / agility の切り上げになる', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 3)

  expect(path).toHaveLength(4)
})

test('最終要素は target と一致する', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 7 }, 3)

  expect(path[path.length - 1]).toEqual({ x: 10, y: 7 })
})

test('minSteps 未指定なら短距離でも1 step (現行互換)', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 1, y: 0 }, 10)

  expect(path).toHaveLength(1)
})

test('minSteps を指定すると短距離でもその step 数以上に分割される', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 1, y: 0 }, 10, 4)

  expect(path).toHaveLength(4)
  expect(path[path.length - 1]).toEqual({ x: 1, y: 0 })
})

test('minSteps より距離基準の step 数が多い場合は距離基準を優先する', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 3, 2)

  expect(path).toHaveLength(4)
})

test('最終 step 以外は stepDistance いっぱい移動する (端数を均等割りしない)', () => {
  const path = generateMovePath({ x: 0, y: 0 }, { x: 10, y: 0 }, 3)

  // 最終step以外 (3個): stepDistance(3)そのまま進む。最終stepのみ端数(1)
  expect(path[0]).toEqual({ x: 3, y: 0 })
  expect(path[1]).toEqual({ x: 6, y: 0 })
  expect(path[2]).toEqual({ x: 9, y: 0 })
  expect(path[3]).toEqual({ x: 10, y: 0 })
})

test('各 step は agility 以下の距離で進む', () => {
  const from = { x: 0, y: 0 }
  const agility = 3
  const path = generateMovePath(from, { x: 10, y: 0 }, agility)

  let previous = from
  for (const step of path) {
    const dx = step.x - previous.x
    const dy = step.y - previous.y
    const stepDistance = Math.sqrt(dx * dx + dy * dy)

    expect(stepDistance).toBeLessThanOrEqual(agility + 1e-9)
    previous = step
  }
})
