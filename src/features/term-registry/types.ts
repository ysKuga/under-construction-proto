import { ComponentPropsWithoutRef, ComponentType } from 'react'

/** 用語の表示 component が受け取る props */
export type TermComponentProps = Pick<
  ComponentPropsWithoutRef<'span'>,
  'className' | 'style'
>

/**
 * 用語1件の情報
 *
 * - ゲーム内・システム内で使用する用語の情報を集約する（issue #284）
 */
export type Term = {
  /** 略称（UI 表示など省スペースが必要な箇所で使用、例: EN） */
  abbreviation?: string
  /** 表示用 className（`ui-term-` + 英語名称） */
  className: string
  /** 用語の表示 component（hover で説明を表示する） */
  component: ComponentType<TermComponentProps>
  /** 説明（prototype 固有の挙動を含まない汎用的な説明） */
  description: string
  /** 表示絵文字（画像の代用） */
  emoji?: string
  /** 英語名称（kebab-case、用語ディレクトリ名と一致） */
  englishName: string
  /** 名称 */
  name: string
}
