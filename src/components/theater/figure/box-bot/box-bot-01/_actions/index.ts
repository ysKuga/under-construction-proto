import { armToggleAction } from './arm-toggle'
import { autoRotateAction } from './auto-rotate'
import { fallAction } from './fall'
import { jumpAction } from './jump'
import { spinAction } from './spin'
import { walkingAction } from './walking'

export * from './define-action'
export * from './types'

/**
 * box-bot が備えるアクション一覧
 *
 * - 配列の順 = `useFrame` の実行順
 * - 追加は descriptor を作ってここへ 1 行、削除は 1 行消すだけ。\
 *   dispatcher(`useBoxBotActionDispatcher`)のメソッド・型もこの配列から導出される
 */
export const BOX_BOT_ACTIONS = [
  jumpAction,
  spinAction,
  autoRotateAction,
  armToggleAction,
  walkingAction,
  fallAction,
] as const

/**
 * 要素クリック → 発火する action イベント名の既定の紐づけ(合成ルート)
 *
 * - bot 本体は要素押下で `ON_CLICK_ELEMENT`(`detail` に押下要素)を発行するだけ。\
 *   「どの要素でどの action を起こすか」を決めるのはここだけ。\
 *   `clickBindings` prop で個別に上書きできる
 * - 既定: 胴 → jump、頭 → spin
 */
export const DEFAULT_CLICK_BINDINGS = {
  body: jumpAction.event,
  head: spinAction.event,
} as const
