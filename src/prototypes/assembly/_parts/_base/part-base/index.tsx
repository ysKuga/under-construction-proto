import { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type StyledDivProps = HTMLAttributes<HTMLDivElement>

/** 基本的なスタイルを適用した div */
export const StyledDiv = ({
  children,
  className,
  ...props
}: StyledDivProps) => {
  return (
    <div
      {...props}
      className={cn(
        'bg-gray-100',
        'border border-solid border-gray-300 rounded-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

type PartBaseProps = StyledDivProps

/** ui-body より生やす部品の基本実装 */
export const PartBase = (props: PartBaseProps) => {
  return <StyledDiv {...props} className={cn('absolute', props.className)} />
}
