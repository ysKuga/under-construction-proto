import { ComponentType } from 'react'

import { Term, TermComponentProps } from '../types'

/** defineTerm へ渡す用語情報（`className`・`component` は defineTerm が付与する） */
type TermDefinition = Omit<Term, 'className' | 'component'>

/** 表示 component の生成時に渡す用語情報 */
type TermInfo<T extends TermDefinition> = Pick<Term, 'className'> & T

/** 表示 component 未指定時の既定（何も描画しない） */
const EmptyComponent = () => null

/**
 * 英語名称（kebab-case）から表示 component の displayName を導出する
 *
 * - 例: `energy-charge-item` → `EnergyChargeItemComponent`
 */
const toDisplayName = (englishName: string) =>
  `${englishName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')}Component`

/**
 * 用語を定義する
 *
 * - `className` は英語名称から導出する（`ui-term-` + 英語名称）
 * - 入力の型を保持する。任意項目（`icon` 等）を指定した用語では、参照側で\
 *   `undefined` を考慮せずに済む
 *
 * @param definition `className`・`component` を除く用語情報
 * @param createComponent 用語情報を受け取り表示 component を返す。\
 *   未指定時は何も描画しない component とする
 */
export const defineTerm = <T extends TermDefinition>(
  definition: T,
  createComponent?: (term: TermInfo<T>) => ComponentType<TermComponentProps>,
): Pick<Term, 'component'> & TermInfo<T> => {
  /** className を付与した用語情報 */
  const term = {
    ...definition,
    className: `ui-term-${definition.englishName}`,
  }

  // component 未指定: 何も描画しない component とする
  if (!createComponent) {
    return { ...term, component: EmptyComponent }
  }

  /** 用語の表示 component */
  const component = createComponent(term)

  component.displayName = toDisplayName(definition.englishName)

  return { ...term, component }
}
