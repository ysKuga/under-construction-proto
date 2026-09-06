import { Button } from '@/components/ui/button'

import { ACTION_LABELS } from '../_constants/action-labels'

/** 配置半径(親要素の一辺に対する割合) */
const RADIUS_RATIO = 0.55

/**
 * Circle — bot を囲む真円の外周にボタンを配置する配置パターン
 *
 * - 画面座標(screen space)上の真円。3D 空間内の投影計算は行わない(`../CLAUDE.md` 参照)
 * - `ACTION_LABELS` を等間隔の角度で親要素(`position: relative` かつ正方形)の外周へ配置する。\
 *   親要素は `../../_components/bot-overlay`(`BotOverlay`)が提供する(詳細は `../CLAUDE.md` 参照)
 */
export const Circle = () => {
  return (
    <div className="relative size-full">
      {ACTION_LABELS.map((label, i) => {
        const angle = (i / ACTION_LABELS.length) * 2 * Math.PI - Math.PI / 2
        const x = 50 + RADIUS_RATIO * 50 * Math.cos(angle)
        const y = 50 + RADIUS_RATIO * 50 * Math.sin(angle)

        return (
          <Button
            className="absolute"
            key={label}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            type="button"
            variant="outline"
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
