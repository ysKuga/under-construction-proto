import { energyTerm } from './terms/energy'
import { energyRecoveryItemTerm } from './terms/energy-recovery-item'
import { energyRecoverySpotTerm } from './terms/energy-recovery-spot'
import { obstacleTerm } from './terms/obstacle'

/**
 * 用語の一覧
 *
 * - キーは英語名称の camelCase（例: `energy-recovery-item` → `energyRecoveryItem`）
 * - 参照例: `term.obstacle.className`
 */
export const term = {
  /** エネルギー */
  energy: energyTerm,
  /** 回復アイテム */
  energyRecoveryItem: energyRecoveryItemTerm,
  /** EN スポット */
  energyRecoverySpot: energyRecoverySpotTerm,
  /** 障害物 */
  obstacle: obstacleTerm,
}
