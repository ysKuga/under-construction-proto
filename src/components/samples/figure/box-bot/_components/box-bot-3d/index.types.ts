import type { CSSProperties } from 'react'

import type { BoxBotModelProps } from './_components/box-bot-model/index.types'

export interface BoxBot3DProps extends BoxBotModelProps {
  background?: string
  className?: string
  orbit?: boolean
  /** 接地影(ContactShadows)の広がり(world)。円形クリップ時など見切れを避けたい場合に縮小する */
  shadowScale?: number
  style?: CSSProperties
}

export type Vec3 = [number, number, number]
