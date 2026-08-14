import { PropsWithChildren } from 'react'

import { createRequiredContext } from './create-required-context'

/**
 * component が受け取った props をそのまま Context として配布する Provider/hook を生成する
 *
 * - Provider は受け取った props を destructure せずそのまま Context value に渡す。\
 *   呼び出し元の props が参照的に安定していれば、その安定性をそのまま活かせる
 * - 未 Provider 時のエラーメッセージは `name` から一律生成する (呼出箇所ごとの文言のばらつきを防ぐ)。\
 *   `<${name}Providers>` という命名 (このリポジトリの Provider 集約命名規約) を前提にする
 *
 * @param name Provider/hook の対象名 (例: `'TimeControl03'`)
 */
export const createPropsContext = <Props extends object>(name: string) => {
  const { Context, useContextValue } = createRequiredContext<
    PropsWithChildren<Props>
  >(`use${name}Props should be used within <${name}Providers>`)

  const Provider = (props: PropsWithChildren<Props>) => (
    <Context.Provider value={props}>{props.children}</Context.Provider>
  )

  const useProps = (): Props => useContextValue()

  return { Provider, useProps }
}
