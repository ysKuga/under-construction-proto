import { createStore, StoreApi } from 'zustand/vanilla'

export type ListItemData = {
  id: string
  name: string
}

export type ListState = {
  addItem: (item: ListItemData) => void
  byId: Record<string, ListItemData>
  ids: string[]
  renameItem: (id: string, name: string) => void
}

export type ListStore = StoreApi<ListState>

/**
 * List02 インスタンスごとに独立した store を生成する
 *
 * - ids (リスト構造) と byId (各要素の実体) を分離して保持する
 * - renameItem は byId のみ更新するため ids の参照は変わらない
 *   → ids を購読する List02 (入れ物) は名前変更で再レンダリングされない
 * (list-01 と同構造、useTransition 検証用に複製)
 * - addItem は ids を新しい配列に置き換えるため、追加時のみ
 *   ids を購読するコンポーネントが再レンダリングされる (これは避けられない)
 */
export const createListStore = (initialItems: ListItemData[]): ListStore => {
  const byId = Object.fromEntries(initialItems.map((item) => [item.id, item]))
  const ids = initialItems.map((item) => item.id)

  return createStore<ListState>((set) => ({
    addItem: (item) => {
      set((state) => ({
        byId: { ...state.byId, [item.id]: item },
        ids: [...state.ids, item.id],
      }))
    },
    byId,
    ids,
    renameItem: (id, name) => {
      set((state) => ({
        byId: {
          ...state.byId,
          [id]: { ...state.byId[id], name },
        },
      }))
    },
  }))
}
