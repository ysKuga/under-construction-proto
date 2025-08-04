import { PropsWithChildren } from 'react'

import { PropsWithStyle } from '@/types/props'
import { cn } from '@/utils/cn'

type AssemblyProps = PropsWithChildren<PropsWithStyle>

/**
 * キャラクターなどの体などを表現する
 * - style に指定した height により拡大縮小可能とする
 * - このコンポーネント自体は正方形として縦横の基準を同一の値にする
 * - 配下要素の位置、高さや幅はすべてパーセンテージで指定する
 */
export const Assembly = (props: AssemblyProps) => {
  const { children, className, style } = props

  return (
    <div
      className={cn(
        'ui-container',
        // コンテナであるため正方形に
        'aspect-square',
        'relative',
        className,
      )}
      style={style}
    >
      <div
        className={cn(
          'ui-assembly',
          // ui-container と一致する大きさにする
          'aspect-square',
          'h-full',
          'relative',
        )}
      >
        {children}
      </div>
    </div>
  )
}
