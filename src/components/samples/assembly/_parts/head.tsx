import { HTMLAttributes } from 'react'

import { twAbsoluteCentering } from '@/styles'
import { cn } from '@/utils/cn'

import { PartBase } from './_base/part-base'

type HeadProps = {
  className?: string
  style?: HTMLAttributes<HTMLDivElement>['style']
}

/**
 * 頭
 */
export const Head = (props: HeadProps) => {
  const { className, style } = props

  return (
    <PartBase
      className={cn('ui-head', 'h-10 w-16', twAbsoluteCentering, className)}
      style={style}
    />
  )
}
