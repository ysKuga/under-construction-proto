import { Button } from '@/components/ui/button'

import { ACTION_LABELS } from '../_constants/action-labels'

/**
 * 各ラベルに対応する bot 部位のおおよその位置(親要素に対する % 座標)
 *
 * - `ACTION_LABELS`(左腕/右腕/転倒/起き上がり/足踏み)の並び順に対応
 * - box-bot の基準姿勢(直立・非回転)を前提にした目視調整値。ジャンプ等で姿勢が動くとずれる
 */
const ANCHOR_POSITIONS = [
  { left: '26%', top: '46%' },
  { left: '74%', top: '46%' },
  { left: '50%', top: '28%' },
  { left: '50%', top: '64%' },
  { left: '50%', top: '80%' },
] as const

/**
 * ActionAnchor — 各操作ボタンを対応する bot の部位のそばに配置する配置パターン
 *
 * - 画面座標(screen space)上の配置。3D 空間内の投影計算は行わない(`../CLAUDE.md` 参照)
 * - 親要素(`position: relative` かつ正方形)は呼び出し側(例: `proto-02/index.tsx`)が\
 *   bot 表示領域と同サイズ・同位置で用意する
 */
export const ActionAnchor = () => {
  return (
    <div className="relative size-full">
      {ACTION_LABELS.map((label, i) => (
        <Button
          className="absolute"
          key={label}
          style={{ ...ANCHOR_POSITIONS[i], transform: 'translate(-50%, -50%)' }}
          type="button"
          variant="outline"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
