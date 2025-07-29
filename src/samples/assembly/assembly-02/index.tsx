import { HTMLAttributes, PropsWithChildren } from 'react'

import { twAbsoluteCentering } from '@/styles'
import { cn } from '@/utils/cn'

import { StyledDiv } from '../_parts/_base/part-base'

type Assembly02Props = PropsWithChildren<{
  /** 最外部の ui-container に設定される */
  className?: string
  /** 最外部の ui-container に設定される */
  style?: HTMLAttributes<HTMLDivElement>['style']
}>

/**
 * キャラクターなどの体などを表現する
 * - children にてパーツを指定する
 */
export const Assembly02 = (props: Assembly02Props) => {
  const { children, className, style } = props

  return (
    <div
      className={cn(
        'ui-container',
        'relative',
        'border border-solid border-gray-300 rounded-sm',
        'h-60 w-60',
        className,
      )}
      style={style}
    >
      <StyledDiv
        className={cn(
          'ui-body',
          'mx-auto',
          'absolute',
          twAbsoluteCentering,
          'bottom-16',
          'h-20 w-14',
        )}
      >
        {children}
      </StyledDiv>
    </div>
  )
}
