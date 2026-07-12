import { useState } from 'react'
import { useStore } from 'zustand'

import { AddItemForm } from './_components/add-item-form'
import { ListItem } from './_components/list-item'
import { TypingProbe } from './_components/typing-probe'
import { ListStoreContext } from './_contexts/list-store-context'
import { busyWait } from './_lib/busy-wait'
import { createListStore, ListItemData } from './_stores/list-store'

type List02Props = {
  /** 初期リスト (大量要素で useTransition の効果を体感する想定) */
  items: ListItemData[]
  /** true の場合 addItem を startTransition でラップする */
  useTransitionEnabled: boolean
}

/**
 * list-01 + useTransition 比較検証
 *
 * - list-01 と同じ ids/byId 分離 store を使用
 * - ids が変わるたび (= addItem 実行時) に、リスト全体の再計算コストを模した
 *   busy-wait を List02 (入れ物) 側で実行する。ListItem 個別の busy-wait は
 *   memo により新規追加分にしか効かないため、addItem のコストを体感するには
 *   ここで要素数分の重さを持たせる必要がある
 * - TypingProbe (リストと無関係な input) への入力のカクつきで、
 *   useTransitionEnabled の有無による体感差を確認する
 */
export const List02 = (props: List02Props) => {
  const { items, useTransitionEnabled } = props

  const [store] = useState(() => createListStore(items))

  const ids = useStore(store, (state) => state.ids)

  busyWait(ids.length * 0.3)

  return (
    <ListStoreContext.Provider value={store}>
      <TypingProbe />
      <ul className="ui-container w-80">
        {ids.map((id) => (
          <ListItem id={id} key={id} />
        ))}
      </ul>
      <AddItemForm useTransitionEnabled={useTransitionEnabled} />
    </ListStoreContext.Provider>
  )
}
