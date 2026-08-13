import { createContext, useContext } from 'react'

/**
 * 必須 Provider 前提の Context 一式を生成する
 *
 * - Context 生成 → 未 Provider 時 throw → 値取得、の定型実装をまとめる
 *
 * @param errorMessage 未 Provider 時に throw するエラーメッセージ
 */
export const createRequiredContext = <Value>(errorMessage: string) => {
  const Context = createContext<null | Value>(null)

  const useContextValue = (): Value => {
    const value = useContext(Context)

    if (value === null) {
      throw new Error(errorMessage)
    }

    return value
  }

  return { Context, useContextValue }
}
