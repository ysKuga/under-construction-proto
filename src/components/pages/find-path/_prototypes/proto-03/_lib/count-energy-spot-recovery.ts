import { EnergyInfo } from '@/components/pages/find-path/_prototypes/_stores/energy/types'

import { ItemInstance } from '../_stores/items/types'

/**
 * EN スポットで補給する回数を求める
 *
 * - 「上限までの不足分」と「スポットの残量」の小さい方（issue #297）
 * - EN スポット（`stock` 指定）でなければ 0
 *
 * @param item 対象セルのアイテム
 * @param energyInfo 補給する actor のエネルギー情報
 */
export const countEnergySpotRecovery = (
  item: ItemInstance | undefined,
  energyInfo: EnergyInfo,
): number => {
  if (item?.stock === undefined) return 0

  return Math.min(
    Math.ceil((energyInfo.max - energyInfo.current) / item.amount),
    item.stock,
  )
}
