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
  const { eventTarget, toggleWalking, walking, walkUnlockedRef } = useProto01()

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
        {/* 解放フラグを持つ hidden checkbox。解放時に walkUnlockedRef 経由で
            checked を直書きし(React state なし)、表示切替は peer-checked: で行う */}
        <input
          aria-hidden
          className="peer hidden"
          readOnly
          ref={walkUnlockedRef}
          tabIndex={-1}
          type="checkbox"
        />
        <Button
          className={cn(
            'pointer-events-none translate-y-3 opacity-0 transition-all duration-300 ease-out',
            'peer-checked:pointer-events-auto peer-checked:translate-y-0 peer-checked:opacity-100',
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
