# @vanilla-extract/css

<https://vanilla-extract.style/>

## 概要

`.css.ts` に TypeScript で記述し、ビルド時に静的 CSS + スコープ済みクラス名へ変換するゼロランタイム CSS-in-JS。

- Tailwind で表現しづらいセレクター駆動のスタイル(兄弟・子孫コンビネータ、`:checked ~ &` 等)に使う。Tailwind とは併用し、置き換えではない。
- 初回用途は `src/hooks/use-css-toggle.css.ts`。hidden checkbox の `:checked` 状態を隣接兄弟セレクターで受け、表示切替を React 再レンダリングなしで行う。
- `style()` の `selectors` キーは `&` を含む形のみ許可。`${otherClass}:checked ~ &`(`&` より前で他クラスを参照)は書けるが、`& ~ ${otherClass}`(`&` から他要素を指す)は `globalStyle` が必要。

## バージョン注意

- `@vanilla-extract/css@1` 本体。ランタイムは実質ゼロ(クラス名文字列に解決)。
- ビルド連携は別パッケージ: [next-plugin](../next-plugin/README.md)(Next.js アプリ)、[vite-plugin](../vite-plugin/README.md)(Storybook・Vitest)。
