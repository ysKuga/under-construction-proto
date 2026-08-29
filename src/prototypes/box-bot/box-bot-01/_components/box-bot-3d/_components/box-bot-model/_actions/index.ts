import { jumpAction } from './jump'

export * from './define-action'
export * from './types'

/**
 * box-bot が備えるアクション一覧
 *
 * - 配列の順 = `useFrame` の実行順
 * - 追加は descriptor を作ってここへ 1 行、削除は 1 行消すだけ。\
 *   dispatcher(`useBoxBotActionDispatcher`)のメソッド・型もこの配列から導出される
 */
export const BOX_BOT_ACTIONS = [jumpAction] as const

/**
 * 要素クリック → 発火する action イベント名の既定の紐づけ(合成ルート)
 *
 * - bot 本体は要素押下で `CLICK_BODY` / `CLICK_HEAD` を発行するだけ。\
 *   「どの要素でどの action を起こすか」を決めるのはここだけ。\
 *   `clickBindings` prop で個別に上書きできる
 */
export const DEFAULT_CLICK_BINDINGS = {
  body: jumpAction.event,
  head: jumpAction.event,
} as const
