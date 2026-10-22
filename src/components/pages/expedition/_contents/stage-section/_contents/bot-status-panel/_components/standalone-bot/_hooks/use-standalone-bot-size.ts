import { useSyncExternalStore } from 'react'

/** 独立 bot の一辺 px（`md` 以上。向きを視認しやすいよう大きめ、issue #248） */
const STANDALONE_BOT_SIZE_MD = 160

/** 独立 bot の一辺 px（`md` 未満。横一列のバーへ収める、issue #393） */
const STANDALONE_BOT_SIZE_SM = 64

/** Tailwind の `md` 以上か判定する media query */
const MD_MEDIA_QUERY = '(min-width: 768px)'

/** `md` の境界をまたいだ時に通知を受ける */
const subscribeMd = (onChange: () => void) => {
  const mediaQueryList = window.matchMedia(MD_MEDIA_QUERY)

  mediaQueryList.addEventListener('change', onChange)

  return () => mediaQueryList.removeEventListener('change', onChange)
}

/**
 * 画面幅に応じた独立 bot の一辺 px
 *
 * - `BoxBot01` は大きさを px の数値で受け、fov・線幅を計算するため、CSS でなく数値で切り替える
 * - サーバー描画時は `md` 以上の大きさ
 */
export const useStandaloneBotSize = (): number =>
  useSyncExternalStore(
    subscribeMd,
    () => window.matchMedia(MD_MEDIA_QUERY).matches,
    () => true,
  )
    ? STANDALONE_BOT_SIZE_MD
    : STANDALONE_BOT_SIZE_SM
