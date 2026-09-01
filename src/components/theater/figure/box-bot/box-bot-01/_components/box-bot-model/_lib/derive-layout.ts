import {
  HEAD_FRONT_MARGIN,
  HEAD_GAP,
  SHOULDER_Y_OFFSET,
} from '../index.constants'
import type { BoxBot3DConfig, BoxBotLayout } from '../index.types'

/**
 * cfg から部位の配置アンカーを導出する
 *
 * - raw 寸法(`cfg.body.w` 等)ではなく、それらを組み合わせた派生座標
 * - 幾何計算を hook から分離し単体テスト可能にする
 *
 * @param cfg マージ済みの box-bot 設定
 */
export const deriveLayout = (cfg: BoxBot3DConfig): BoxBotLayout => {
  const bodyTop = cfg.body.h / 2
  // 脚グループの付け根(-bodyTop)から脚 1 本ぶん下がった足元
  const groundY = -bodyTop - cfg.leg.h
  // 頭上端(頭の付け根 + 頭の高さ)
  const headTopY = bodyTop + HEAD_GAP + cfg.head.h

  return {
    center: {
      // 足元〜頭上端の中点。直立時にカメラが収める範囲の中心。fall の回転 pivot に使う
      y: (headTopY + groundY) / 2,
    },
    ground: {
      y: groundY,
    },
    head: {
      front: cfg.head.d / 2 + HEAD_FRONT_MARGIN,
      y: bodyTop + HEAD_GAP + cfg.head.h / 2,
    },
    leg: {
      x: (cfg.body.w / 2) * cfg.leg.gap,
      y: -bodyTop,
    },
    shoulder: {
      x: cfg.body.w / 2,
      y: bodyTop - SHOULDER_Y_OFFSET,
    },
  }
}
