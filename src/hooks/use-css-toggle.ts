import { type RefObject, useCallback, useRef } from 'react'

/**
 * useCssToggle の戻り値
 */
export type UseCssToggleReturn = {
  /** hidden な `<input type="checkbox">` へ渡す ref */
  checkboxRef: RefObject<HTMLInputElement | null>
  /** checkbox の checked を指定値へ直書きする */
  set: (next: boolean) => void
  /** checkbox の checked を反転する */
  toggle: () => void
}

/**
 * boolean を hidden checkbox の checked へ橋渡しする CSS トグル
 *
 * - 返す `checkboxRef` を hidden な `<input type="checkbox">` へ付け、表示側は\
 *   tailwind の `peer` / `peer-checked:` で定義する
 * - `set` / `toggle` は `checkbox.checked` を直書きするだけで React state を持たない。\
 *   値の切替で再レンダリングされない
 * - Observable の subscribe や event ハンドラから `set` / `toggle` を呼ぶ用途。\
 *   初期値は JSX 側の `defaultChecked` で表現する
 */
export const useCssToggle = (): UseCssToggleReturn => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  const set = useCallback((next: boolean) => {
    if (checkboxRef.current) checkboxRef.current.checked = next
  }, [])

  const toggle = useCallback(() => {
    set(!checkboxRef.current?.checked)
  }, [set])

  return { checkboxRef, set, toggle }
}
