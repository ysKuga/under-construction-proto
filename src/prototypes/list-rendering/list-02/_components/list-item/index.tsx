import { memo } from 'react'

import { useListStore } from '../../_contexts/list-store-context'
import { busyWait } from '../../_lib/busy-wait'

type ListItemProps = {
  id: string
}

/**
 * リストの1要素 (list-01 と同構造 + 人工的な重さ)
 *
 * - memo により、addItem 時は新規追加分のみこの busyWait が実行される。
 *   既存要素の busyWait コスト (= 大量要素の再計算コスト) を体感したい場合は
 *   List02 (親) 側の busyWait を見ること
 */
export const ListItem = memo((props: ListItemProps) => {
  const { id } = props

  const item = useListStore((state) => state.byId[id])
  const renameItem = useListStore((state) => state.renameItem)

  busyWait(0.3)

  return (
    <li className="flex items-center gap-2 border-b border-solid border-gray-200 p-2">
      <span className="w-16 text-gray-400">{item.id}</span>
      <input
        className="border border-solid border-gray-300 px-2 py-1"
        onChange={(event) => {
          renameItem(item.id, event.target.value)
        }}
        value={item.name}
      />
    </li>
  )
})

ListItem.displayName = 'ListItem'
