import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { ItemUsage } from '../_lib/item-usage'
import { ItemInstance } from '../_stores/items/types'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `FindPath-`
 * - 発行は全て cancelable。listener が `preventDefault()` すると dispatcher の\
 *   戻り値が `false` になり、UI 側は実行を取りやめる（ui-jurisdiction 案 1）
 */
export type FindPathEventMap = {
  /** 提示中の経路に沿って自動移動を開始する */
  'FindPath-execute-path': {
    /** 自動移動する経路 */
    path: HexCell[]
  }
  /**
   * アイテムが使用された（`FindPath-use-item` の受理後に通知する）
   *
   * - 使用方法ごとの効果は、この通知を購読する listener が `usage` で判別して処理する
   */
  'FindPath-item-used': {
    /** 使用されたアイテム（携行からは取り除き済み） */
    item: ItemInstance
    /** 使用方法 */
    usage: ItemUsage
  }
  /** 非隣接セルのクリックで、そのセルを目標とした経路を提示する */
  'FindPath-propose-path': {
    /** 目標セル */
    cell: HexCell
  }
  /**
   * チェックポイント（開始位置）へリセットする
   *
   * - EN 切れ中かつ停止中のみ受理する。それ以外は拒否される
   * - 位置・EN を戻し、盤面の状態・携行アイテムは保持する（issue #289）
   */
  'FindPath-reset-to-checkpoint': undefined
  /**
   * bot 頭上に表示中の吹き出しを揺らす
   *
   * - 操作が拒否されたことを知らせるために発行する（拒否の理由は問わない）
   * - 表示中の吹き出しが購読して揺れる。購読がなければ何も起きない
   */
  'FindPath-shake-bot-bubble': undefined
  /**
   * player の現在セルの EN スポットを使用し、EN を回復する
   *
   * - 停止中かつ EN が上限未満の場合のみ受理する。それ以外は拒否される
   * - 回復量は「上限までの不足分」と「スポットの残量」の小さい方とし、\
   *   1 回復あたり 300 ms の時間を経過させる（中断なし。issue #297）
   */
  'FindPath-use-energy-spot': undefined
  /**
   * 携行中のアイテムを、指定した使用方法で使用する
   *
   * - 使用方法がアイテムに許可されていなければ拒否される（`getItemUsages`）
   */
  'FindPath-use-item': {
    /** 使用する携行アイテムの id */
    itemId: string
    /** 使用方法 */
    usage: ItemUsage
  }
}
