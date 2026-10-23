# React 実装規約

## ロジック分離

コンポーネント内でのロジック実装、できるだけ回避する。

- カスタムフックとして切り出す
- 配置先: `.hooks` サフィックスファイル、または `_hooks/` ディレクトリ
- 戻り値の名前: `use` 除いた部分 基本的に使用する。ライブラリ等で公式の使用法がある場合はそちらに合わせる
- hook 自体の命名: 戻り値を単一の変数でそのまま受ける想定なら、`use` を除いた部分が変数名としてそのまま自然になるよう名付ける。戻り値が値(名詞)でなく関数の場合、hook 名にも動詞を含める(例: `useCellTitle` ではなく `useGetCellTitle` → `const getCellTitle = useGetCellTitle()`)

```ts
// 悪い例: 戻り値が関数なのに hook 名は名詞
const getCellTitle = useCellTitle()

// 良い例: hook 名に動詞を含め、use を除いた名前がそのまま変数名になる
const getCellTitle = useGetCellTitle()
```

### 構成分割 (index.tsx / index.hooks.ts / index.types.ts / index.constants.ts)

ロジック規模大きいコンポーネント、下記構成へ分割する。

```
component-name/
  index.tsx        # JSX のみ。ロジックは index.hooks.ts の use<ComponentName> 呼出すだけ
  index.hooks.ts    # ベース hook use<ComponentName>。_hooks/ 配下の部品 hook 組合せるだけ
  index.types.ts    # <ComponentName>Props, Use<ComponentName>Return 定義
  index.constants.ts # 定数(必要な場合のみ)
  _hooks/
    use-xxx.ts       # 関心事ごとの部品 hook。1 hook = 1 ファイル、kebab-case
```

- ベース hook 名: コンポーネント名に `use` 付与(`ActionBar` → `useActionBar`)
- 部品 hook の引数: コンポーネント props そのまま渡す(個別プロパティへ分解しない)
- 部品 hook の戻り値型: 個別定義せず、`index.types.ts` の `Use<ComponentName>Return` から `Pick` で抽出する。型の出所を一元化する
- 定数ファイル名: 本構成では `index.constants.ts`(`constants.ts` にしない)
  - `_stores`・`_contexts` の種類別ファイル(`constants.ts`)は [aggregation-index.md](../aggregation-index.md) に従う
- 置き場の判断
  - state の保持(`useState`)と、その派生値の計算 → 部品 hook(`_hooks/`)
  - 部品 hook 同士の配線(ある部品 hook の戻り値を別の部品 hook へ渡す) → ベース hook
    - 部品 hook 内で同列の部品 hook を import しない([sibling-import.md](../sibling-import.md))
  - 定数 → `index.constants.ts`。部品 hook・ベース hook・`index.tsx` のどこからも参照できる

#### 理由

expedition の standalone-bot の分割(PR #402)で、規約の確認の指摘を受け置き場を 3 回直した。

- `constants.ts` で作成 → 同じ構成の前例(`index.constants.ts`)へ改名
- 中継の配線を部品 hook へ置いた → 同列の部品 hook の import になり、ベース hook へ移した
- ベース hook で `useState` を直接持った → 部品 hook へ切り出した

## useEffect

- ラインコメントで処理内容 簡潔に記述する
- カスタムフック化を優先する。フック名は `useEffect〜` とする

## create~Context 系ユーティリティの再 export

`createStoreContext`/`createPropsContext`/`createRequiredContext` 等の戻り値、`export const useX = useY` で直接代入 再 export しない。関数でラップして export する。

- 理由: 直接代入だとエディタの定義ジャンプが utility 内部の実装へ飛び、各 store/context 側の宣言箇所に辿り着けない
- selector 購読系、`Parameters<typeof useStoreSelector<T>>` で引数型を由来元から自動導出し、型定義の重複を避ける

```ts
// 悪い例
export const usePositionStore = useStoreSelector

// 良い例
export const usePositionStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)
```
