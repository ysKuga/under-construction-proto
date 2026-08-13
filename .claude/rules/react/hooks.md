# React 実装規約

## ロジック分離

コンポーネント内でのロジック実装、できるだけ回避する。

- カスタムフックとして切り出す
- 配置先: `.hooks` サフィックスファイル、または `_hooks/` ディレクトリ
- 戻り値の名前: `use` 除いた部分 基本的に使用する。ライブラリ等で公式の使用法がある場合はそちらに合わせる

### 構成分割 (index.tsx / index.hooks.ts / index.types.ts)

ロジック規模大きいコンポーネント、下記構成へ分割する。

```
component-name/
  index.tsx        # JSX のみ。ロジックは index.hooks.ts の use<ComponentName> 呼出すだけ
  index.hooks.ts    # ベース hook use<ComponentName>。_hooks/ 配下の部品 hook 組合せるだけ
  index.types.ts    # <ComponentName>Props, Use<ComponentName>Return 定義
  _hooks/
    use-xxx.ts       # 関心事ごとの部品 hook。1 hook = 1 ファイル、kebab-case
```

- ベース hook 名: コンポーネント名に `use` 付与(`ActionBar` → `useActionBar`)
- 部品 hook の引数: コンポーネント props そのまま渡す(個別プロパティへ分解しない)
- 部品 hook の戻り値型: 個別定義せず、`index.types.ts` の `Use<ComponentName>Return` から `Pick` で抽出する。型の出所を一元化する

## useEffect

- ラインコメントで処理内容 簡潔に記述する
- カスタムフック化を優先する。フック名は `useEffect〜` とする
