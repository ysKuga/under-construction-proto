import { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

import { PartBase } from './_base/part-base'

/** foot 用基本スタイル */
const twFoot = 'h-12 w-5'

type FootProps = {
  className?: string
  style?: HTMLAttributes<HTMLDivElement>['style']
}

/**
 * 足
 */
export const Foot = (props: FootProps) => {
  const { className, style } = props

  return <PartBase className={cn('ui-foot', twFoot, className)} style={style} />
}
