import { memo } from 'react'

import { useListStore } from '../../_contexts/list-store-context'

type ListItemProps = {
  id: string
}

/**
 * リストの1要素
 *
 * - props で受け取るのは id のみ (不変)。実体は store から直接購読する
 * - 名前変更時、変更対象の id の selector 結果のみが新しい参照になるため、
 *   この要素のみ再レンダリングされる
 */
export const ListItem = memo((props: ListItemProps) => {
  const { id } = props

  const item = useListStore((state) => state.byId[id])
  const renameItem = useListStore((state) => state.renameItem)

  console.log(`render: ListItem ${id}`)

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
