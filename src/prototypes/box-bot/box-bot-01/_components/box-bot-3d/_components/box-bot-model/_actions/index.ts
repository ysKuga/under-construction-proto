import { jumpAction } from './jump'

export * from './define-action'
export * from './types'

/**
 * box-bot が備えるアクション一覧
 *
 * - 配列の順 = `useFrame` の実行順
 * - 追加は descriptor を作ってここへ 1 行、削除は 1 行消すだけ。\
 *   dispatcher(`useBoxBotActionDispatcher`)のメソッド・型もこの配列から導出される
 * - 現状は jump のみレジストリ化。spin/fall/getUp/arm/leg/autorotate/bobbing は\
 *   `_action-hooks/` 側で従来どおり `useBoxBotModel` から直接呼ぶ(順次移行)
 */
export const BOX_BOT_ACTIONS = [jumpAction] as const
