import { CellContent } from '../_stores/items/types'

import { getItemPresentation } from './item-presentation'

/**
 * セル上の要素（障害物・アイテム）の hover 説明文言
 *
 * - アイテムの文言は `getItemPresentation`（`_lib/item-presentation.ts`）へ委譲する。
 *   表示（絵文字・className）と文言を同じ辞書で一元管理するため（issue #137、
 *   PR #196 レビュー対応）
 */
export const describeCellContent = (content: CellContent): string =>
  content.kind === 'obstacle'
    ? '障害物（通行不可）'
    : getItemPresentation(content.item).title
