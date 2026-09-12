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

/**
 * ゴールセル
 *
 * - stage-06 の隅 (0,0) / (cols-1,rows-1) は動作確認用の静的 bot 表示に占有されて
 *   おりクリックが吸われるため避ける（`ActorsLayer` の `staticCells`）
 */
export const GOAL_POSITION = { col: 3, row: 3 } as const
