import BoxBot2D from './_components/box-bot-2d'
import BoxBot3D from './_components/box-bot-3d'
import type { BoxBotProps } from './index.types'

export { ACTION_SPIN, BODY_HEIGHT_RATIO } from './_components/box-bot-3d'

/**
 * BoxBot — 手描き風ボックスロボット
 *
 * - mode='2d'(既定): SVG 手描き風
 * - mode='3d': react-three-fiber 3D モデル
 */
export const BoxBot = (props: BoxBotProps) => {
  if (props.mode === '3d') {
    return <BoxBot3D {...props} />
  }

  return <BoxBot2D {...props} />
}
