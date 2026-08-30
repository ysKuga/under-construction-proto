import { deriveLayout } from '../_lib/derive-layout'
import {
  DEFAULTS,
  HEAD_FRONT_MARGIN,
  HEAD_GAP,
  SHOULDER_Y_OFFSET,
} from '../index.constants'

test('DEFAULTS から既知のアンカー座標を導出する', () => {
  const layout = deriveLayout(DEFAULTS)

  // bodyTop = body.h / 2 = 0.85
  expect(layout.head.y).toBeCloseTo(0.85 + HEAD_GAP + DEFAULTS.head.h / 2)
  expect(layout.head.front).toBeCloseTo(DEFAULTS.head.d / 2 + HEAD_FRONT_MARGIN)
  expect(layout.shoulder.x).toBeCloseTo(DEFAULTS.body.w / 2)
  expect(layout.shoulder.y).toBeCloseTo(0.85 - SHOULDER_Y_OFFSET)
  expect(layout.leg.x).toBeCloseTo((DEFAULTS.body.w / 2) * DEFAULTS.leg.gap)
  expect(layout.leg.y).toBeCloseTo(-0.85)
  // 脚の付け根(-0.85)から脚 1 本ぶん下がった足元
  expect(layout.ground.y).toBeCloseTo(-0.85 - DEFAULTS.leg.h)
  // 足元 と 頭上端(0.85 + HEAD_GAP + head.h)の中点
  const headTop = 0.85 + HEAD_GAP + DEFAULTS.head.h
  expect(layout.center.y).toBeCloseTo((headTop + (-0.85 - DEFAULTS.leg.h)) / 2)
})

test('body.h を上げると頭は上へ、脚の付け根は下へ動く', () => {
  const taller = {
    ...DEFAULTS,
    body: { ...DEFAULTS.body, h: DEFAULTS.body.h + 1 },
  }

  const base = deriveLayout(DEFAULTS)
  const grown = deriveLayout(taller)

  expect(grown.head.y).toBeGreaterThan(base.head.y)
  expect(grown.leg.y).toBeLessThan(base.leg.y)
  expect(grown.ground.y).toBeLessThan(base.ground.y)
  // 頭上端と足元が同量ずつ外へ広がるため、中点は body.h に依らない
  expect(grown.center.y).toBeCloseTo(base.center.y)
})

test('leg.gap は脚の x オフセットのみに効く', () => {
  const wideGap = {
    ...DEFAULTS,
    leg: { ...DEFAULTS.leg, gap: DEFAULTS.leg.gap * 2 },
  }

  const base = deriveLayout(DEFAULTS)
  const wide = deriveLayout(wideGap)

  expect(wide.leg.x).toBeCloseTo(base.leg.x * 2)
  expect(wide.shoulder.x).toBeCloseTo(base.shoulder.x)
})
