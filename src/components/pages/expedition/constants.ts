/** グリッド形状 */
export const GRID = { cols: 5, rows: 5 } as const

/** 六角形の外接円半径 (px) */
export const HEX_SIZE = 40

/** bot(box-bot-01)の一辺 px */
export const BOT_SIZE = 56

/**
 * 目標セルのオーバーレイアンカーを actors store へ登録する際の擬似 id
 *
 * - 目標セル側にも bot と同じ吹き出しを注入するため、actor 用の overlay anchor を流用する
 * - actor の id（`PLAYER_ACTOR_ID` 等）と重複しない値にする
 */
export const OBJECTIVE_OVERLAY_ID = 'objective'

/** EN スポットでの 1 回の補給あたりの所要時間（ms。issue #297） */
export const ENERGY_SPOT_CHARGE_INTERVAL_MS = 300

/** EN スポットでの補給の完了（「補給完了！」）を表示し続ける時間（ms。issue #297） */
export const ENERGY_SPOT_CHARGED_NOTICE_MS = 1500
