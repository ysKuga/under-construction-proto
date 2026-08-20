import type { BoxBotProps as BoxBot2DProps } from './_components/box-bot-2d/index.types'
import type { BoxBot3DProps } from './_components/box-bot-3d/index.types'

export type BoxBotProps =
  | ({
      /** 表示モード(既定: '2d') */
      mode?: '2d'
    } & BoxBot2DProps)
  | ({
      /** 表示モード */
      mode: '3d'
    } & BoxBot3DProps)
