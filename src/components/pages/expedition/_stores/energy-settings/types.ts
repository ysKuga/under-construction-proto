import { StoreApi } from 'zustand/vanilla'

/**
 * EN の調整設定を保持する store
 *
 * - 操作パネルで切り替え、移動成立時の処理が読む
 */
export type EnergySettingsState = {
  /** 移動 1 マスあたりの EN 消費量。0 で EN 無限（消費なし） */
  consumePerMove: number
  /** 移動 1 マスあたりの EN 消費量を切り替える */
  setConsumePerMove: (consumePerMove: number) => void
}

export type EnergySettingsStore = StoreApi<EnergySettingsState>
