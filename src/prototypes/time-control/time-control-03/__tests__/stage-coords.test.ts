import {
  STAGE_CENTER,
  STAGE_SCALE,
} from '../../time-control-02/_lib/stage-coords'
import { computeFitTransform, toPixelStyle } from '../_lib/stage-coords'

test('actor が存在しない場合は既定 transform になる', () => {
  expect(computeFitTransform([])).toEqual({
    centerX: 0,
    centerY: 0,
    scale: STAGE_SCALE,
  })
})

test('全 actor が同一点の場合は bounding box が 0 になり既定 scale にフォールバックする', () => {
  const transform = computeFitTransform([{ x: 5, y: 5 }])

  expect(transform).toEqual({ centerX: 5, centerY: 5, scale: STAGE_SCALE })
})

test('bounding box が表示領域に収まる場合は拡大せず既定 scale のままになる', () => {
  const transform = computeFitTransform([
    { x: 0, y: 0 },
    { x: 2, y: 0 },
  ])

  expect(transform.scale).toBe(STAGE_SCALE)
  expect(transform.centerX).toBe(1)
  expect(transform.centerY).toBe(0)
})

test('bounding box が表示領域を超える場合は収まるまで縮小する', () => {
  const transform = computeFitTransform([
    { x: -50, y: 0 },
    { x: 50, y: 0 },
  ])

  expect(transform.scale).toBeLessThan(STAGE_SCALE)
  expect(transform.centerX).toBe(0)
})

test('縦横で必要 scale が異なる場合はより厳しい (小さい) 方を採用する', () => {
  const wide = computeFitTransform([
    { x: -50, y: -10 },
    { x: 50, y: 10 },
  ])
  const tall = computeFitTransform([
    { x: -10, y: -50 },
    { x: 10, y: 50 },
  ])

  expect(wide.scale).toBe(tall.scale)
})

test('toPixelStyle は transform の中心・scale を反映する', () => {
  const style = toPixelStyle(
    { x: 10, y: 5 },
    { centerX: 0, centerY: 0, scale: STAGE_SCALE },
  )

  expect(style).toEqual({
    left: STAGE_CENTER + 10 * STAGE_SCALE,
    top: STAGE_CENTER + 5 * STAGE_SCALE,
  })
})
