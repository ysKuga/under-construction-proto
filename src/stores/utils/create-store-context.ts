import { createContext, useContext } from 'react'
import { useStore } from 'zustand'
import { StoreApi } from 'zustand/vanilla'

/**
 * store 用 Context 一式を生成する
 *
 * - 各 store の context.tsx で共通していた「Context 生成 → 未 Provider 時 throw →\
 *   `useStore` で購読」の定型実装をまとめる
 * - `useStoreApi` は生 store を返す。selector を経由しない直接購読\
 *   (`store.subscribe` + `store.getState()`) が必要な store のみ、\
 *   context.tsx 側で追加 export する
 *
 * @param storeName store 名 (例: `ActorSettings`)。エラーメッセージの hook 名・Context 名生成に使う
 */
export const createStoreContext = <State>(storeName: string) => {
  const StoreContext = createContext<null | StoreApi<State>>(null)

  const useStoreApi = (): StoreApi<State> => {
    const store = useContext(StoreContext)

    if (store === null) {
      throw new Error(
        `use${storeName}Store should be used within <${storeName}StoreContext.Provider>`,
      )
    }

    return store
  }

  /**
   * @param selector 購読する state の一部を取り出す関数
   * @param equalityFn 再レンダリング要否の比較関数 (省略時は `Object.is`)
   */
  const useStoreSelector = <T>(
    selector: (state: State) => T,
    equalityFn?: (a: T, b: T) => boolean,
  ): T => useStore(useStoreApi(), selector, equalityFn)

  return { StoreContext, useStoreApi, useStoreSelector }
}
