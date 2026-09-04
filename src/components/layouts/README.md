# components/layouts/

ページの外枠・レイアウト部品を格納する。

- `_base/` — `<html>`/`<body>` と `SerwistProvider`(Service Worker 登録)を担うベース layout。App Router の [app/layout.tsx](../../app/layout.tsx) でのみ使う。Storybook は独自の `<html>`/`<body>` を持つため対象外
- `content-layout.tsx` 等 — ページ内で使うレイアウト部品

## 依存方向

`layouts/` から `pages/` を参照しない。`app/layout.tsx` が `_base` で [pages/layout](../pages/README.md) をラップして組み立てる。
