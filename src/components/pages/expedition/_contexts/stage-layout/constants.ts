import { StageLayout } from './types'

/**
 * 既定の盤面配置（固定値）
 *
 * - `items`: 配置・補給量は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整）
 *   - `(1,1)`: 当初 `(0,1)` だったが、START `(0,0)` の隣接セルで実際に表示される
 *     のは障害物 `(1,0)` とこのマスのみ（座標変換の関係で他の隣接は画面外）だった
 *     ため、EN デバッグ操作で EN 切れを作ろうとしても必ず EN 補給アイテムを踏んでしまい
 *     検証できなかった。START 隣接から外すため移動（issue-181-en）
 * - `spots`: 配置・残量は仮値（issue-181-en design.md 懸念・リスク、後日バランス調整。issue #297）
 */
export const DEFAULT_STAGE_LAYOUT: StageLayout = {
  goal: { q: 3, r: 2 },
  items: [{ amount: 3, q: 1, r: 1 }],
  obstacles: [
    { q: 1, r: 0 },
    { q: 2, r: 1 },
    { q: 3, r: 0 },
  ],
  oneWays: [
    { exitDirection: 'right', q: 1, r: 3 },
    { exitDirection: 'lower-left', q: 4, r: 0 },
  ],
  spots: [{ amount: 1, q: 0, r: 3, stock: 4 }],
  start: { q: 0, r: 0 },
}
