# r3f state 保持方針

`useFrame` 内でのみ読み書きし、JSX の再レンダリングに関与しない値は `useState` でなく `useRef` で保持する。

## 理由

React Compiler の `react-hooks/refs` ルールは、レンダー中に `ref.current` を読んで他の hook/JSX へ値として渡す操作を禁止する。ref オブジェクト自体(参照)を渡すことは抵触しない。`useFrame` コールバック内で `.current` を直接読み書きする形にすれば安全。

`useState` で持つと、値が変わるたびコンポーネントが再レンダリングされる。Three.js オブジェクトへの反映自体は `useFrame` 側で完結するため、この再レンダリングは不要なコストになる。

## 複数消費者

複数の action hook から同じ ref を参照する場合、Context 経由で配布する(box-bot-model の `BoxBotRefsProvider`/`useBoxBotRefs` 例)。
