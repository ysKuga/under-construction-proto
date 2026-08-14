# children props

Component の props 型、`children: ReactNode` 手動定義でなく `PropsWithChildren<T>` 使用する。

```ts
// 悪い例
type FooProps = {
  bar: string
  children: ReactNode
}

// 良い例
type FooProps = PropsWithChildren<{
  bar: string
}>
```

children 以外のプロパティ無い場合、ジェネリクス省略した `PropsWithChildren` 単体で可。

```ts
type FooProps = PropsWithChildren
```
