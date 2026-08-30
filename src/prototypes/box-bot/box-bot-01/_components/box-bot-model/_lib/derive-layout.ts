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

  return {
    ground: {
      // 脚グループの付け根(-bodyTop)から脚 1 本ぶん下がった位置
      y: -bodyTop - cfg.leg.h,
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
