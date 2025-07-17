import { HTMLAttributes, PropsWithChildren } from 'react'

/** コンポーネントへのスタイル指定を行う props */
export type PropsWithStyle = {
  className?: string
  style?: HTMLAttributes<Element>['style']
}
