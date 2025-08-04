import { cn } from '@/utils/cn'

import { PartBase, StyledDiv } from '../_parts/_base/part-base'

/**
 * absolute 用中央寄せ
 * - translateX(-50%) left: 50%
 */
const twCentering = '-translate-x-1/2 left-1/2'

/** arm 用基本スタイル */
const twArm = 'h-16 w-4'

/** foot 用基本スタイル */
const twFoot = 'h-12 w-5'

type Assembly01Props = {
  /** 最外部の ui-container に設定される */
  className?: string
}

/**
 * キャラクターなどの体などを表現する
 */
export const Assembly01 = (props: Assembly01Props) => {
  const { className } = props

  return (
    <div
      className={cn(
        'ui-container',
        'relative',
        'border border-solid border-gray-300 rounded-sm',
        'h-60 w-60',
        className,
      )}
    >
      <StyledDiv
        className={cn(
          'ui-body',
          'mx-auto',
          'absolute',
          twCentering,
          'bottom-16',
          'h-20 w-14',
        )}
      >
        <PartBase className={cn(twCentering, '-top-12', 'h-10 w-16')}>
          {/* TODO 目などを設置 */}
        </PartBase>
        <PartBase
          className={cn(
            twArm,
            '-left-6',
            // 回転アニメーション
            'origin-top animate-spin direction-reverse',
          )}
        />
        <PartBase
          className={cn(
            twArm,
            '-right-6',
            // 回転アニメーション
            'origin-top animate-spin',
          )}
          style={{}}
        />
        <PartBase className={cn(twFoot, 'left-0 -bottom-14')} />
        <PartBase className={cn(twFoot, 'right-0 -bottom-14')} />
      </StyledDiv>
    </div>
  )
}
