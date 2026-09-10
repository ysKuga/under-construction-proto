# @vanilla-extract/next-plugin

<https://vanilla-extract.style/documentation/integrations/next/>

## 概要

Next.js アプリのビルドへ [vanilla-extract](../css/README.md) の `.css.ts` 変換を組み込むプラグイン。`next.config.mjs` で `withSerwist` と合成している。

- Next.js 16 は Turbopack が既定(`next dev` / `next build` とも)。`createVanillaExtractPlugin({ unstable_turbopack: { mode: 'auto' } })` で Next16 以上のとき Turbopack 連携を有効化する。
- 内部で `@vanilla-extract/turbopack-plugin` を使用。

## バージョン注意

- Turbopack 連携は experimental 扱い。公式に「API is unstable and may undergo breaking changes in non-major versions」と明記。
- 動作確認(2026-09-10): `yarn build`(Turbopack)・`yarn build-storybook`・`yarn test` すべて通過。
- 壊れた場合の退避は `unstable_turbopack: { mode: 'off' }`(webpack ビルドへ戻す)。
