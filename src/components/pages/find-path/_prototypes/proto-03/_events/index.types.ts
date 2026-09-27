import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { ItemUsage } from '../_lib/item-usage'

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
  /** 非隣接セルのクリックで、そのセルを目標とした経路を提示する */
  'FindPath-propose-path': {
    /** 目標セル */
    cell: HexCell
  }
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
