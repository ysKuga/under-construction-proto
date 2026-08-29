import { JUMP_DEFAULTS } from './_actions/jump/config'
import type { BoxBot3DConfig } from './index.types'

export const DEFAULTS: BoxBot3DConfig = {
  arm: {
    d: 0.18,
    leftAngle: -0.5,
    leftLen: 1.15,
    rightAngle: 2.4,
    rightLen: 1.0,
    w: 0.18,
  },
  body: { d: 1.4, h: 1.7, w: 2.0 },
  eye: { d: 0.06, h: 0.34, offset: 0.42, w: 0.06 },
  head: { d: 1.2, h: 1.0, w: 1.6 },
  ink: '#191B21',
  jump: JUMP_DEFAULTS,
  leg: { d: 0.22, gap: 0.5, h: 0.5, w: 0.22 },
  lineWidth: 2.5,
  outline: true,
  outlineWidth: 0.03,
  paper: '#FBFAF6',
  seed: 7,
  sketch: 0.035,
  sketchDetail: 7,
}

/** 胴体上端から頭下端までの隙間(world) */
export const HEAD_GAP = 0.1
/** 肩の y 位置。胴体上端からのオフセット(world) */
export const SHOULDER_Y_OFFSET = 0.2
/** 頭前面から目・口を浮かせる量(world、z-fighting 回避) */
export const HEAD_FRONT_MARGIN = 0.01
