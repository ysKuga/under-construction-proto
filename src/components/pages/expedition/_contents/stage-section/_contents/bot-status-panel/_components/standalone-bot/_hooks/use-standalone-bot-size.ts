import { useSyncExternalStore } from 'react'

import { UseStandaloneBotReturn } from '../index.types'

/** 独立 bot の一辺 px（`md` 以上。向きを視認しやすいよう大きめ、issue #248） */
const STANDALONE_BOT_SIZE_MD = 160

/** 独立 bot の一辺 px（`md` 未満。横一列のバーへ収める、issue #393） */
const STANDALONE_BOT_SIZE_SM = 64

/**
 * 表示領域(Canvas)の高さの、設置領域の一辺に対する倍率
 *
 * - EN 切れで拡大した接地影が下端で見切れないよう、設置領域より縦へ伸ばす
 * - `canvasHeight` は上下対称に伸びる(下だけ伸ばすには BoxBot01 のカメラ改修が要るため不採用)。\
 *   上側の伸長分は透明で見た目に影響しない
 * - 設置領域は変えないため周囲のレイアウトは不変。bot の見かけの大きさも不変(fov 補正)
 */
const STANDALONE_BOT_CANVAS_HEIGHT_RATIO = 1.5

/** Tailwind の `md` 以上か判定する media query */
const MD_MEDIA_QUERY = '(min-width: 768px)'

/** `md` の境界をまたいだ時に通知を受ける */
const subscribeMd = (onChange: () => void) => {
  const mediaQueryList = window.matchMedia(MD_MEDIA_QUERY)

  mediaQueryList.addEventListener('change', onChange)

  return () => mediaQueryList.removeEventListener('change', onChange)
}

/**
 * 画面幅に応じた独立 bot の一辺・表示領域の高さ px
 *
 * - `BoxBot01` は大きさを px の数値で受け、fov・線幅を計算するため、CSS でなく数値で切り替える
 * - サーバー描画時は `md` 以上の大きさ
 */
export const useStandaloneBotSize = (): Pick<
  UseStandaloneBotReturn,
  'canvasHeight' | 'standaloneBotSize'
> => {
  /** `md` 以上か */
  const isMd = useSyncExternalStore(
    subscribeMd,
    () => window.matchMedia(MD_MEDIA_QUERY).matches,
    () => true,
  )
  /** 独立 bot の一辺 px（画面幅で切替） */
  const standaloneBotSize = isMd
    ? STANDALONE_BOT_SIZE_MD
    : STANDALONE_BOT_SIZE_SM

  return {
    canvasHeight: standaloneBotSize * STANDALONE_BOT_CANVAS_HEIGHT_RATIO,
    standaloneBotSize,
  }
}
