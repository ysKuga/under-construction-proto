# components/pages/

`src/app/` 配下 page.tsx / layout.tsx 系ファイルの実装置き場。配置方針は [app/CLAUDE.md](../../app/CLAUDE.md) 参照。

## 使用構造

- `/`
  - `home/`
  - トップページ
  - `home/_prototypes/` — トップページの試作。採用中のものを `home/index.tsx` が描画する
- `/_not-found`
  - `not-found/`
  - 404 ページ

## layout

- `layout.tsx` — アプリ共通のページ枠(`AppProvider` + `<main>`)。`metadata` もここで持つ。`<html>`/`<body>` は持たず、[../layouts/_base](../layouts/README.md) が担当する
- `layout.decorator.tsx` — Storybook で `layout.tsx` の枠を story へ適用する decorator。ページ相当の story(`home` / `not-found` 等)の meta へ個別に設定する(`preview.tsx` の全 story には効かせない)
