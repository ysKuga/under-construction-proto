import { nanoid } from 'nanoid'
import { FormEvent, useRef } from 'react'

import { useListStore } from '../../_contexts/list-store-context'

/**
 * 行追加フォーム
 *
 * - input を uncontrolled (ref) で管理する。value/onChange による
 *   controlled state を持たないため、タイピングのたびに
 *   AddItemForm 自体が再レンダリングされることがない
 * - submit 時のみ ref から値を読み、store.addItem を呼ぶ
 */
export const AddItemForm = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const addItem = useListStore((state) => state.addItem)

  console.log('render: AddItemForm')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = inputRef.current?.value ?? ''

    if (!name) {
      return
    }

    addItem({ id: nanoid(), name })

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
        追加
      </button>
    </form>
  )
}
