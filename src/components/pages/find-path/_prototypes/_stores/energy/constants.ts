import { EnergyInfo } from './types'

/**
 * エネルギー未設定 actor のデフォルト値
 *
 * - 初期値・上限は仮値（design.md 懸念・リスク、後日バランス調整）
 */
export const DEFAULT_ENERGY_INFO: EnergyInfo = {
  current: 10,
  max: 10,
}

/**
 * EN 切れ演出（予防姿勢）発火までの遅延（ms、演出上のタメ）
 *
 * - proto-01/03 共通。`useOutOfEnergyEventListener` が使う
 */
export const ENERGY_OUT_DELAY_MS = 300
