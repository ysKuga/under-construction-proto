import { Button } from '@/components/ui/button'

import { ACTION_LABELS } from '../_constants/action-labels'

/**
 * 四辺中央の position(上/右/下/左の順、`ACTION_LABELS` の先頭 4 件に対応)
 *
 * - 5 件目(`足踏み`)は四角形の辺に対応先が無いため未使用
 */
const EDGE_POSITIONS = [
  { left: '50%', top: 0, transform: 'translate(-50%, -50%)' },
  { right: 0, top: '50%', transform: 'translate(50%, -50%)' },
  { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' },
  { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
] as const

/**
 * ActionSquare — bot を囲う四角形の四辺にボタンを配置する配置パターン
 *
 * - 画面座標(screen space)上の四角形。親要素(`position: relative` かつ正方形)は呼び出し側\
 *   (`../../index.tsx`)が bot 表示領域と同サイズ・同位置で用意する(`../CLAUDE.md` 参照)
 */
export const ActionSquare = () => {
  return (
    <div className="relative size-full">
      {EDGE_POSITIONS.map((pos, i) => (
        <Button
          className="absolute"
          key={ACTION_LABELS[i]}
          style={pos}
          type="button"
          variant="outline"
        >
          {ACTION_LABELS[i]}
        </Button>
      ))}
    </div>
  )
}
