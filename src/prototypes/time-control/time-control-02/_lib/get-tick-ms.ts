/** tick の実時間長を求める基準値 */
export const BASE_TICK_MS = 400

/**
 * tickRate から tick の実時間長を求める
 *
 * - tickRate は内部実装用の値。画面表示用の「敏捷性 (agility)」は将来\
 *   別途追加予定、両者は別名にしておく (agility → tickRate への変換式は未定)
 *
 * @param tickRate tick の発生頻度
 */
export const getTickMs = (tickRate: number): number => BASE_TICK_MS / tickRate
