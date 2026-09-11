/**
 * tick 1 回分の論理時間（ms）
 *
 * - 1 tick = bot 1 セルぶんの移動。tc-03 の `getTickMs(tickRate)` に相当するが、
 *   find-path proto は actor store を持ち込まないため固定値にしている
 */
export const TICK_MS = 400

/**
 * auto 進行の実時間刻み（ms）
 *
 * - `timeScale` はこの刻み単位で反映される。tc-03 position store の
 *   `REALTIME_STEP_MS` と同値
 */
export const REALTIME_STEP_MS = 10
