# esbuild

<https://esbuild.github.io/>

## 概要

`@serwist/turbopack` が Service Worker をビルドする際に使うバンドラ本体。`createSerwistRoute` の `useNativeEsbuild: true` 指定で直接利用される

## バージョン注意

`esbuild-wasm` の代わりに native 版を使う設定にしているため、直接依存として導入している
