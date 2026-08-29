import type {
  BoxBotAction,
  BoxBotActionBaseContext,
  BoxBotActionContext,
} from './types'

/** `defineAction` に渡す生のアクション定義(`use` はラップ前) */
type ActionInput<Name extends string, Config> = {
  /** このアクションの設定の既定値 */
  defaults?: Config
  /** dispatch が投げる CustomEvent の type */
  event: string
  /** dispatcher のキー */
  name: Name
  /** Canvas 内で実行する購読・可視化フック。`ctx.config` は解決済みで渡る */
  use: (ctx: BoxBotActionContext<Config>) => void
}

/**
 * `BoxBotAction` を型推論を効かせつつ定義する
 *
 * - `use` を、`defaults` と `ctx.actionConfig[name]` をマージした `config` を差し込む\
 *   形にラップして返す。設定のマージ・アクション名をキーにした引き当てはこの 1 箇所に閉じ、\
 *   orchestrator は生の `actionConfig` bag を ctx へ載せるだけでよい
 *
 * @param action アクション定義(`use` はラップ前)
 */
export const defineAction = <Name extends string, Arg = never, Config = never>(
  action: ActionInput<Name, Config>,
): BoxBotAction<Name, Arg, Config> => ({
  ...action,
  use: (ctx: BoxBotActionBaseContext) =>
    action.use({
      ...ctx,
      config: {
        ...action.defaults,
        ...ctx.actionConfig?.[action.name],
      } as Config,
    }),
})
