# @vanilla-extract/vite-plugin

<https://vanilla-extract.style/documentation/integrations/vite/>

## 概要

Vite ベースのツールへ [vanilla-extract](../css/README.md) の `.css.ts` 変換を組み込むプラグイン。本プロジェクトでは Next.js 本体でなく周辺ツール向け。

- `.storybook/main.ts`: `viteFinal` で `config.plugins` へ追加(Storybook は `@storybook/nextjs-vite` builder)。
- `vitest.config.ts`: `plugins` 先頭へ追加。`.css.ts` を import するコンポーネントのテストに必要。

## バージョン注意

- `@vanilla-extract/vite-plugin@5` 系。Vite 7 で動作(2026-09-10 確認)。
- next-plugin の Turbopack 連携と違い experimental ではない。
