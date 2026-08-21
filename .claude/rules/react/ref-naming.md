# ref 変数命名

`useRef()` の戻り値を受ける変数、`Ref` サフィックスを付与する。

```ts
// 悪い例
const root = React.useRef<Group>(null)

// 良い例
const rootRef = React.useRef<Group>(null)
```

- JSX の `ref` 属性へ渡す ref(DOM/Object3D 等)・値保持用の ref(`useRef(-1)` 等)どちらも対象
- hook の戻り値としてプロパティ公開する場合、プロパティ名も同様に `Ref` サフィックスを付与する(`UseXxxReturn` の型定義含む)
