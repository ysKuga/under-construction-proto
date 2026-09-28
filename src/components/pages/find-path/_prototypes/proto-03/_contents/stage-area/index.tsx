'use client'

import { CarriedItems } from './_contents/carried-items'
import { FacingIndicator } from './_contents/facing-indicator'
import { FacingSyncToggle } from './_contents/facing-sync-toggle'
import { Stage } from './_contents/stage'
import { StandaloneBot } from './_contents/standalone-bot'

/**
 * ステージと bot の状態表示を横に並べる
 *
 * - bot の状態表示は、独立 bot を上・向きインジケータを下に縦に並べる
 * - 独立 bot の表示領域は設置領域からはみ出すため、重ねる要素・向きインジケータを `z-10` で前面に置く
 * - 独立 bot の右上に向きの同期・固定の切替ボタンを重ねる
 * - 独立 bot の右下に携行アイテムの使用ボタン群を重ねる。同様の要素が増えた場合は\
 *   右下の枠（右寄せの横並び）へ追加する
 */
export const StageArea = () => (
  <div className="flex items-center gap-8">
    <Stage />
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <StandaloneBot />
        <div className="absolute right-0 top-0 z-10">
          <FacingSyncToggle />
        </div>
        <div className="absolute bottom-0 right-0 z-10 flex items-end gap-2">
          <CarriedItems />
        </div>
      </div>
      <div className="relative z-10">
        <FacingIndicator />
      </div>
    </div>
  </div>
)
