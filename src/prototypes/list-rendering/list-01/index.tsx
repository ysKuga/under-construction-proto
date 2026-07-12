import { useState } from 'react'
import { useStore } from 'zustand'

import { AddItemForm } from './_components/add-item-form'
import { ListItem } from './_components/list-item'
import { ListStoreContext } from './_contexts/list-store-context'
import { createListStore, ListItemData } from './_stores/list-store'

type List01Props = {
  /** 初期リスト */
  items: ListItemData[]
}

/**
 * リスト表示
 *
 * - 「入れ物」(List01) 自体が state (useState) を持つ設計だと、
 *   名前変更のたびに入れ物自体も再レンダリングされてしまう
 * - state を zustand の vanilla store (Context 経由で配布) に外出しし、
 *   List01 自体は store を購読しないことで再レンダリングを抑止する
 * - store は List01 インスタンスごとに1つだけ生成 (useState の遅延初期化)
 * - List01 は ids のみ購読する。renameItem は ids を変えないため
 *   名前変更では再レンダリングされない。addItem は ids を変えるため
 *   行追加時のみ再レンダリングされる (これは避けられない)
 */
export const List01 = (props: List01Props) => {
  const { items } = props

  const [store] = useState(() => createListStore(items))

  const ids = useStore(store, (state) => state.ids)

  console.log('render: List01')

  return (
    <ListStoreContext.Provider value={store}>
      <ul className="ui-container w-80">
        {ids.map((id) => (
          <ListItem id={id} key={id} />
        ))}
      </ul>
      <AddItemForm />
    </ListStoreContext.Provider>
  )
}
