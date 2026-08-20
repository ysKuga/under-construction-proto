import type { CSSProperties } from 'react'

import type { BoxBotModelProps } from './_components/box-bot-model/index.types'

export interface BoxBot3DProps extends BoxBotModelProps {
  background?: string
  className?: string
  orbit?: boolean
  style?: CSSProperties
}

export type Vec3 = [number, number, number]
