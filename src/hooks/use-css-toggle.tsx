import { type ReactElement, useCallback, useRef } from 'react'

import * as styles from './use-css-toggle.css'

/**
 * useCssToggle の戻り値
 */
export type UseCssToggleReturn = {
  /**
   * 表示切替の起点になる hidden checkbox 要素
   *
   * - スタイル付与済み。表示切替対象の直前へ兄弟として置く
   * - ref は hook 内部で保持するため、消費側は配置するだけでよい
   */
  checkbox: ReactElement
  /** checkbox の checked を指定値へ直書きする */
  set: (next: boolean) => void
  /** checkbox の checked を反転する */
  toggle: () => void
  /**
   * checkbox の checked に応じて表示を出し入れする className
   *
   * - `checkbox` を直前に置いた表示切替対象へ渡す
   * - off: 非表示、on: 表示(vanilla-extract の兄弟セレクターで切替)
   * - 遷移の時間・イージングは含めない。必要なら消費側で `transition` を足す
   */
  toggledClassName: string
}

/**
 * boolean を hidden checkbox の checked へ橋渡しする CSS トグル
 *
 * - 返す `checkbox` を表示切替対象の直前へ置き、対象へ `toggledClassName` を渡す。\
 *   表示切替は vanilla-extract の `checkbox:checked ~ &` セレクターで定義する
 * - `set` / `toggle` は `checkbox.checked` を直書きするだけで React state を持たない。\
 *   値の切替で再レンダリングされない
 * - Observable の subscribe や event ハンドラから `set` / `toggle` を呼ぶ用途
 *
 * @param defaultChecked checkbox の初期 checked 値
 */
export const useCssToggle = (defaultChecked = false): UseCssToggleReturn => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  const set = useCallback((next: boolean) => {
    if (checkboxRef.current) checkboxRef.current.checked = next
  }, [])

  const toggle = useCallback(() => {
    set(!checkboxRef.current?.checked)
  }, [set])

  const checkbox = (
    <input
      aria-hidden
      className={styles.checkbox}
      defaultChecked={defaultChecked}
      readOnly
      ref={checkboxRef}
      tabIndex={-1}
      type="checkbox"
    />
  )

  return { checkbox, set, toggle, toggledClassName: styles.toggled }
}
