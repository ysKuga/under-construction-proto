import type { RefObject } from 'react'

import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  BoxBotRefs,
} from '../index.types'

/**
 * box-bot アクションの定義
 *
 * - 1 アクション = 1 フォルダ(`_actions/<name>/`)がこの descriptor を 1 つ export する
 * - `use()` は Canvas 内で実行される購読・可視化フック。固有の ref はその中で `useRef` する
 *
 * @typeParam Name アクション名(dispatcher のキーになる)
 * @typeParam Arg dispatch 時に渡せる引数の型(無ければ `never`)
 */
export type BoxBotAction<Name extends string = string, Arg = never> = {
  /** dispatch 引数の型マーカー。値は保持しない */
  arg?: Arg
  /** dispatch が投げる CustomEvent の type */
  event: string
  /** dispatcher のキー */
  name: Name
  /** Canvas 内で実行する購読・可視化フック */
  use: (ctx: BoxBotActionContext) => void
}

/**
 * 各 box-bot アクションの `use()` に渡す実行コンテキスト
 *
 * - Canvas 内(`useBoxBotModel`)で 1 度だけ組み立て、全アクションで共有する
 * - アクション固有の状態(進行度 ref 等)は各アクションが `use()` 内で自前に持つ。\
 *   ここには bot 本体と共有するものだけを載せる
 */
export type BoxBotActionContext = {
  /** マージ済みの設定値 */
  cfg: BoxBot3DConfig
  /**
   * 表示領域(Canvas ラッパー DOM)の ref
   *
   * - 縦移動などで表示領域そのものを動かすアクションが直接操作する。`BoxBot3D`(bot の外殻)が生成する
   */
  displayAreaRef?: RefObject<HTMLDivElement | null>
  /** action イベント発行/購読に使う EventTarget */
  eventTarget: EventTarget
  /** BoxBotModel に渡された props */
  props: Omit<BoxBotModelProps, 'eventTarget'>
  /** bot 本体で共有する ref 群 */
  refs: BoxBotRefs
}

/**
 * `BoxBotAction` を型推論を効かせつつ定義する
 *
 * @param action アクション定義
 */
export const defineAction = <Name extends string, Arg = never>(
  action: BoxBotAction<Name, Arg>,
): BoxBotAction<Name, Arg> => action

/**
 * アクション配列から `useBoxBotActionDispatcher` の該当メソッド群の型を導出する
 *
 * - 引数型 `Arg` が `never` のアクションは `() => Promise<void>`、\
 *   それ以外は `(override?: Arg) => Promise<void>` になる
 */
export type BoxBotActionDispatchers<
  T extends readonly BoxBotAction<string, unknown>[],
> = {
  [A in T[number] as A['name']]: [NonNullable<A['arg']>] extends [never]
    ? () => Promise<void>
    : (override?: NonNullable<A['arg']>) => Promise<void>
}
