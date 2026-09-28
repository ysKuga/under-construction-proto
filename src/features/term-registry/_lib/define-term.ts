import { Term } from '../types'

/**
 * 用語を定義する
 *
 * - `className` は英語名称から導出する（`ui-term-` + 英語名称）
 *
 * @param term `className` を除く用語情報
 */
export const defineTerm = (term: Omit<Term, 'className'>): Term => ({
  ...term,
  className: `ui-term-${term.englishName}`,
})
