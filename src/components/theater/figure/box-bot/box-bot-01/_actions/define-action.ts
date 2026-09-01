import type {
  BoxBotAction,
  BoxBotActionBaseHost,
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
  /** Canvas 内で実行する購読・可視化フック。`host.config` は解決済みで渡る */
  use: (host: BoxBotActionContext<Config>) => void
}

/**
 * `BoxBotAction` を型推論を効かせつつ定義する
 *
 * - `use` を、`defaults` と `host.actionConfig[name]` をマージした `config` を差し込む\
 *   形にラップして返す。設定のマージ・アクション名をキーにした引き当てはこの 1 箇所に閉じ、\
 *   orchestrator は生の `actionConfig` bag を host へ載せるだけでよい
 *
 * @param action アクション定義(`use` はラップ前)
 */
export const defineAction = <Name extends string, Arg = never, Config = never>(
  action: ActionInput<Name, Config>,
): BoxBotAction<Name, Arg, Config> => ({
  ...action,
  use: (host: BoxBotActionBaseHost) =>
    action.use({
      ...host,
      config: {
        ...action.defaults,
        ...host.actionConfig?.[action.name],
      } as Config,
    }),
})
