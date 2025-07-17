import { HTMLAttributes } from 'react'

import { twAbsoluteCentering } from '@/styles'
import { cn } from '@/utils/cn'

import { PartBase } from './_base/part-base'

type BodyProps = {
  className?: string
  style?: HTMLAttributes<HTMLDivElement>['style']
}

/** 体 */
export const Body = (props: BodyProps) => {
  const { className, style } = props

  return (
    <PartBase
      className={cn(
        'ui-body',
        'mx-auto',
        'absolute',
        twAbsoluteCentering,
        'bottom-16',
        'h-20 w-14',
        className,
      )}
      style={style}
    />
  )
}
