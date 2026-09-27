import { ItemInstance, ItemKind } from '../_stores/items/types'

/**
 * アイテムの使用方法
 *
 * - 使用イベント（`FindPath-use-item`）で使用方法として指定する
 * - 用途を増やす際はここへ追加し、`ITEM_USAGES` へ許可するアイテムを足す。\
 *   効果は `FindPath-item-used` を購読する listener を用途ごとに追加して実装する
 */
export type ItemUsage = 'recover-energy'

/**
 * アイテム種別ごとに許可する使用方法（ホワイトリスト）
 *
 * - 先頭を代表的な用途とし、UI はこれを提示する（`getPrimaryItemUsage`）
 * - UI が提示する用途に限らず、ここで許可した用途はすべて使用できる\
 *   （ローグライクでは想定外の用途が活路を開くことがあるため、用途を UI 側で制限しない）
 */
const ITEM_USAGES: Record<ItemKind, readonly [ItemUsage, ...ItemUsage[]]> = {
  'energy-recovery': ['recover-energy'],
}

/**
 * アイテムに許可された使用方法を返す
 *
 * - 状況（EN 残量・位置等）に応じた許可は、必要になった時点で引数を足して判定する
 *
 * @param item 対象のアイテム
 */
export const getItemUsages = (item: ItemInstance): readonly ItemUsage[] =>
  ITEM_USAGES[item.kind]

/**
 * アイテムの代表的な使用方法を返す（UI が提示する用途）
 *
 * @param item 対象のアイテム
 */
export const getPrimaryItemUsage = (item: ItemInstance): ItemUsage =>
  ITEM_USAGES[item.kind][0]
