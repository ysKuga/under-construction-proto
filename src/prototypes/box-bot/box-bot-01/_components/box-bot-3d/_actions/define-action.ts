import type { BoxBotAction } from './types'

/**
 * `BoxBotAction` を型推論を効かせつつ定義する
 *
 * @param action アクション定義
 */
export const defineAction = <Name extends string, Arg = never>(
  action: BoxBotAction<Name, Arg>,
): BoxBotAction<Name, Arg> => action
