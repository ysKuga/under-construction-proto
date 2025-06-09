import { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

import { PartBase } from '../../_parts/_base/part-base'

/** arm 用基本スタイル */
const twArm = 'h-16 w-4'

type ArmProps = {
  className?: string
  style?: HTMLAttributes<HTMLDivElement>['style']
}

/**
 * 腕
 */
export const Arm = (props: ArmProps) => {
  const { className, style } = props

  return <PartBase className={cn('ui-arm', twArm, className)} style={style} />
}
