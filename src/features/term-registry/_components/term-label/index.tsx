import { PropsWithChildren } from 'react'

import { cn } from '@/utils/cn'

import { Term, TermComponentProps } from '../../types'

type TermLabelProps = PropsWithChildren<
  TermComponentProps & {
    /** 表示対象の用語 */
    term: Pick<Term, 'className' | 'description'>
  }
>

/**
 * 用語の表示 component の共通部分
 *
 * - 用語の className を付与し、hover で説明を表示する
 * - hover 表示は現状 `title` 属性による暫定表示
 * - `as` でタグを指定できる。`null` の場合はタグで囲まず内容のみ描画する
 */
export const TermLabel = ({
  as: Tag = 'span',
  children,
  className,
  style,
  term,
}: TermLabelProps) => {
  // タグなし: 内容のみ描画する
  if (Tag === null) {
    return children
  }

  return (
    <Tag
      className={cn(term.className, className)}
      style={style}
      title={term.description}
    >
      {children}
    </Tag>
  )
}
