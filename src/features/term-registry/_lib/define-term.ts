import { Term } from '../types'

/**
 * 用語を定義する
 *
 * - `className` は英語名称から導出する（`ui-term-` + 英語名称）
 * - 入力の型を保持する。任意項目（`emoji` 等）を指定した用語では、参照側で\
 *   `undefined` を考慮せずに済む
 *
 * @param term `className` を除く用語情報
 */
export const defineTerm = <T extends Omit<Term, 'className'>>(
  term: T,
): T & Pick<Term, 'className'> => ({
  ...term,
  className: `ui-term-${term.englishName}`,
})
