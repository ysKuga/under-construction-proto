import { energyTerm } from './terms/energy'
import { energyChargeItemTerm } from './terms/energy-charge-item'
import { energyChargeSpotTerm } from './terms/energy-charge-spot'
import { obstacleTerm } from './terms/obstacle'

/**
 * 用語の一覧
 *
 * - キーは英語名称の camelCase（例: `energy-charge-item` → `energyChargeItem`）
 * - 参照例: `term.obstacle.className`
 */
export const term = {
  /** エネルギー */
  energy: energyTerm,
  /** EN 補給アイテム */
  energyChargeItem: energyChargeItemTerm,
  /** EN スポット */
  energyChargeSpot: energyChargeSpotTerm,
  /** 障害物 */
  obstacle: obstacleTerm,
}
