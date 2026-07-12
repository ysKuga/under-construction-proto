import { useState } from 'react'

/**
 * 体感確認用の独立 input
 *
 * - リストの state / store とは完全に無関係
 * - 大量リスト更新中にこの input への入力がカクつくかどうかで、
 *   useTransition の効果 (メインスレッドのブロック有無) を体感する
 */
export const TypingProbe = () => {
  const [text, setText] = useState('')

  return (
    <div className="border-b border-solid border-gray-300 p-2">
      <label
        className="mb-1 block text-sm text-gray-500"
        htmlFor="typing-probe"
      >
        体感確認用 (リストと無関係、行追加中にここへ入力してカクつきを見る)
      </label>
      <input
        className="w-full border border-solid border-gray-300 px-2 py-1"
        id="typing-probe"
        onChange={(event) => {
          setText(event.target.value)
        }}
        placeholder="ここに入力しながら「追加」を押す"
        value={text}
      />
    </div>
  )
}
