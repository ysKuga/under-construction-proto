'use client'

import { ListChecks, Pin, PinOff, X } from 'lucide-react'
import { ForwardedRef, forwardRef, useId } from 'react'

import { useChoicePanel } from './index.hooks'
import { ChoicePanelHandle, ChoicePanelProps } from './index.types'

/**
 * 呼び出しボタンと、選択肢を横に並べるパネル（issue #393）
 *
 * - 開閉は `useChoicePanel`（選択肢が現れたら開く・Esc で閉じる等）
 * - パネルは CSS anchor positioning で呼び出しボタンを覆う
 *   - 上端・左端: 呼び出しボタン
 *   - 右端: 画面右端から 16px。`popoverClassName` で上書きできる
 *   - 幅: 左右の位置で決める（`w-auto`）。ポップオーバーの UA スタイル `width: fit-content` だと中身の幅に縮むため
 *   - 高さ: 90px 固定（`md` 未満の bot の状態表示と同じ）。あふれたら縦スクロール
 * - 選択肢は横に並べ、幅を超えたら折り返す
 * - 右上の × でパネルのみ閉じる（ピン留めも外す）
 * - 右上のピン留めボタンで、外側のクリック・Esc で閉じないようにする（設定ポップオーバーと同じ）
 * - 操作の拒否を知らせるために揺らす（`ChoicePanelHandle.shake`）
 */
export const ChoicePanel = forwardRef(
  (props: ChoicePanelProps, ref: ForwardedRef<ChoicePanelHandle>) => {
    const { choices, popoverClassName = '' } = props
    const { close, handlePinClick, open, pinned, popoverRef, toggle } =
      useChoicePanel(props, ref)
    /** ピン留めボタンのアイコン（クリックで変更される先） */
    const PinIcon = pinned ? PinOff : Pin
    /** ポップオーバーの id（呼び出しボタンの `aria-controls` から参照） */
    const popoverId = useId()

    return (
      <>
        <button
          aria-controls={popoverId}
          aria-expanded={open}
          aria-label="選択肢"
          className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-600 [anchor-name:--expedition-choice-panel] hover:bg-gray-100"
          onClick={toggle}
          title="選択肢"
          type="button"
        >
          <ListChecks size={16} />
        </button>
        <div
          className={`m-0 h-[90px] w-auto overflow-y-auto rounded border border-gray-300 bg-white p-3 pr-14 shadow [left:anchor(left)] [position-anchor:--expedition-choice-panel] [right:1rem] [top:anchor(top)] ${popoverClassName}`}
          id={popoverId}
          popover={pinned ? 'manual' : 'auto'}
          ref={popoverRef}
        >
          <div className="absolute right-2 top-2 flex">
            <button
              aria-label="ピン留め"
              aria-pressed={pinned}
              className="rounded p-1 text-gray-600 hover:bg-gray-100"
              onClick={handlePinClick}
              title={pinned ? 'ピン留めを外す' : 'ピン留めする'}
              type="button"
            >
              <PinIcon size={14} />
            </button>
            <button
              aria-label="選択肢を閉じる"
              className="rounded p-1 text-gray-600 hover:bg-gray-100"
              onClick={close}
              title="選択肢を閉じる"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
          {choices.length === 0 ? (
            <p className="text-sm text-gray-500">選択肢なし</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {choices.map(({ id, label, onSelect, pressed }) => (
                <button
                  aria-pressed={pressed}
                  className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 aria-pressed:bg-gray-200"
                  key={id}
                  onClick={onSelect}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </>
    )
  },
)

ChoicePanel.displayName = 'ChoicePanel'
