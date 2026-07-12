import { nanoid } from 'nanoid'
import { FormEvent, useRef, useTransition } from 'react'

import { useListStore } from '../../_contexts/list-store-context'

type AddItemFormProps = {
  /** true の場合 addItem の実行を startTransition でラップする */
  useTransitionEnabled: boolean
}

/**
 * 行追加フォーム
 *
 * - input は list-01 同様 uncontrolled (ref)、タイピング自体の再描画は常にゼロ
 * - useTransitionEnabled が true の場合、addItem (= 大量要素の再レンダリングを
 *   引き起こす更新) を startTransition で低優先度にする。isPending 中は
 *   ボタンの表記で進行中であることを示す
 * - false の場合は同期的に addItem を実行し、大量要素の再レンダリングが
 *   完了するまでメインスレッドをブロックする (比較対象)
 */
export const AddItemForm = (props: AddItemFormProps) => {
  const { useTransitionEnabled } = props

  const inputRef = useRef<HTMLInputElement>(null)

  const addItem = useListStore((state) => state.addItem)

  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = inputRef.current?.value ?? ''

    if (!name) {
      return
    }

    const item = { id: nanoid(), name }

    if (useTransitionEnabled) {
      startTransition(() => {
        addItem(item)
      })
    } else {
      addItem(item)
    }

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <form className="flex gap-2 p-2" onSubmit={handleSubmit}>
      <input
        className="border border-solid border-gray-300 px-2 py-1"
        placeholder="新しい名前"
        ref={inputRef}
      />
      <button
        className="border border-solid border-gray-300 px-2 py-1"
        type="submit"
      >
        {isPending ? '追加中...' : '追加'}
      </button>
    </form>
  )
}
