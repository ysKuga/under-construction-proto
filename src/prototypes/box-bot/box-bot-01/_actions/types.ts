import type { RefObject } from 'react'

import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  BoxBotRefs,
} from '../_components/box-bot-model/index.types'

/**
 * per-action 設定の外部上書き (`actionConfig` prop / ctx)
 *
 * - キー = アクション名、値 = そのアクションの設定の部分指定
 * - 厳密なキー・値型は外殻 (`BoxBot3DProps`) が `BoxBotActionConfigs` で付け直す。\
 *   box-bot-model 内部はアクション名を静的に知らないため緩い形で受ける
 */
export type ActionConfigOverrides = Record<
  string,
  Record<string, unknown> | undefined
>

/** アクション一覧を受け取る箇所で使う、引数型・設定型を問わない `BoxBotAction` */
export type AnyBoxBotAction = BoxBotAction<string, unknown, unknown>

/**
 * box-bot アクションの定義
 *
 * - 1 アクション = 1 フォルダ(`_actions/<name>/`)がこの descriptor を 1 つ export する
 * - `use()` は Canvas 内で実行される購読・可視化フック。固有の ref はその中で `useRef` する
 * - `defaults` を持つアクションは、その値と `actionConfig` 上書きをマージした結果が\
 *   `use()` の `ctx.config` に型付きで渡る(マージは `defineAction` が行う)
 *
 * @typeParam Name アクション名(dispatcher のキーになる)
 * @typeParam Arg dispatch 時に渡せる 1 回上書きの型(無ければ `never`)
 * @typeParam Config `defaults` / `ctx.config` の型(設定を持たなければ `never`)
 */
export type BoxBotAction<
  Name extends string = string,
  Arg = never,
  Config = never,
> = {
  /** dispatch 引数の型マーカー。値は保持しない */
  arg?: Arg
  /** このアクションの設定の既定値。`ctx.config` の下地になる */
  defaults?: Config
  /** dispatch が投げる CustomEvent の type */
  event: string
  /** dispatcher のキー */
  name: Name
  /** Canvas 内で実行する購読・可視化フック(`defineAction` がラップ済み) */
  use: (ctx: BoxBotActionBaseContext) => void
}

/**
 * orchestrator (`useBoxBotModel`) が組み立てる、`config` 差し込み前のコンテキスト
 *
 * - Canvas 内で 1 度だけ組み立て、全アクションで共有する
 * - アクション固有の状態(進行度 ref 等)は各アクションが `use()` 内で自前に持つ。\
 *   ここには bot 本体と共有するものだけを載せる
 */
export type BoxBotActionBaseContext = {
  /** アクション名をキーにした設定の外部上書き(`defineAction` のラッパーが参照) */
  actionConfig?: ActionConfigOverrides
  /** マージ済みの bot 設定(ジオメトリ・見た目) */
  cfg: BoxBot3DConfig
  /**
   * 表示領域(Canvas ラッパー DOM)の ref
   *
   * - 縦移動などで表示領域そのものを動かすアクションが直接操作する。`BoxBot3D`(bot の外殻)が生成する
   */
  displayAreaRef?: RefObject<HTMLDivElement | null>
  /** action イベント発行/購読に使う EventTarget */
  eventTarget: EventTarget
  /** BoxBotModel に渡された props(注入系は除く) */
  props: Omit<BoxBotModelProps, 'actions' | 'clickBindings' | 'eventTarget'>
  /** bot 本体で共有する ref 群 */
  refs: BoxBotRefs
}

/**
 * アクション配列から per-action 設定の型を導出する(`actionConfig` prop の厳密型)
 *
 * - `defaults` を持つアクションだけがキーになる
 */
export type BoxBotActionConfigs<
  T extends readonly BoxBotAction<string, unknown, unknown>[],
> = {
  [
    A in T[number] as [A['defaults']] extends [undefined] ? never : A['name']
  ]: NonNullable<A['defaults']>
}

/**
 * 各 box-bot アクションの `use()` が受け取る実行コンテキスト
 *
 * - `BoxBotActionBaseContext` に、解決済みの `config` を加えたもの
 * - `config` は `defineAction` のラッパーがアクションごとに差し込む
 *
 * @typeParam Config このアクションの設定型(`defineAction` の `Config`)
 */
export type BoxBotActionContext<Config = never> = {
  /** このアクションの解決済み設定(`defaults` ← `actionConfig` 上書き) */
  config: Config
} & BoxBotActionBaseContext

/**
 * アクション配列から `useBoxBotActionDispatcher` の該当メソッド群の型を導出する
 *
 * - 引数型 `Arg` が `never` のアクションは `() => Promise<void>`、\
 *   それ以外は `(override?: Arg) => Promise<void>` になる
 */
export type BoxBotActionDispatchers<
  T extends readonly BoxBotAction<string, unknown, unknown>[],
> = {
  [A in T[number] as A['name']]: [NonNullable<A['arg']>] extends [never]
    ? () => Promise<void>
    : (override?: NonNullable<A['arg']>) => Promise<void>
}
