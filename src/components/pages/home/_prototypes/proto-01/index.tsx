'use client'

import { BoxBot } from '@/components/samples/figure/box-bot'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

import { useProto01 } from './index.hooks'

/**
 * Proto01 — トップページ試作
 *
 * - box-bot を body/head クリックで 3 回ジャンプさせると「歩く」ボタンが出る
 */
const Proto01 = () => {
  const {
    eventTarget,
    toggleWalking,
    walkButtonClassName,
    walking,
    walkUnlockedCheckbox,
  } = useProto01()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Under Construction Proto
      </h1>
      {/* canvasHeight: 最大ズームイン時に頭が Canvas 上端で見切れないよう縦の可動域を足す。
          fov 側で補正するため bot の見かけの大きさは不変(#108) */}
      <BoxBot
        bodyBobbing
        canvasHeight={640}
        eventTarget={eventTarget}
        mode="3d"
      />
      {/* ボタン領域を常時確保する。条件マウントすると flex 再センタリングで
          BoxBot ラッパーが動き、内部の絶対配置 Canvas ごと bot が跳ねる(カクつき)。
          Canvas(設置領域より大きい)が被るため z-index を明示 */}
      <div className="relative z-10 flex h-9 items-center">
        {/* 解放フラグを持つ hidden checkbox(useCssToggle が生成)。解放時に
            checked を直書きし(React state なし)、表示切替は vanilla-extract の
            兄弟セレクターで行う */}
        {walkUnlockedCheckbox}
        <Button
          className={cn(
            // 表示制御(表示/非表示)は hook、以下は遷移の演出のみ
            walkButtonClassName,
            'transition-all duration-300 ease-out',
          )}
          onClick={toggleWalking}
          type="button"
          variant="outline"
        >
          {walking ? '止まる' : '歩く'}
        </Button>
      </div>
    </div>
  )
}

export default Proto01
