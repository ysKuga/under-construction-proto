import { EnInfo } from './types'

/**
 * EN 未設定 actor のデフォルト値
 *
 * - 初期値・上限は仮値（design.md 懸念・リスク、後日バランス調整）
 */
export const DEFAULT_EN_INFO: EnInfo = {
  current: 10,
  max: 10,
}
