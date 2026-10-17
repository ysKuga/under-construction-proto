import { CSSProperties } from 'react'

/** グリッド形状 */
export const GRID = { cols: 5, rows: 5 } as const

/** 六角形の外接円半径 (px) */
export const HEX_SIZE = 40

/** bot(box-bot-01)の一辺 px */
export const BOT_SIZE = 56

/** 床の傾き(rotateX, deg)の初期値 */
export const INITIAL_TILT_DEG = 55

/**
 * 値調整スライダーの label スタイル
 *
 * - 1 要素 1 行にし、見出し | バー | 値 の列を全 label で同じ幅に揃える
 * - ステージの調整スライダー・EN のスライダーで共用する
 */
export const SLIDER_LABEL_STYLE: CSSProperties = {
  alignItems: 'center',
  columnGap: 8,
  display: 'grid',
  gridTemplateColumns: '10em 160px auto',
}

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
