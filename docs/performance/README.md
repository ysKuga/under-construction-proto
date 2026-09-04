# パフォーマンス

本プロジェクトはアプリのパフォーマンスを重視する。品質の優先順位は確実性 > パフォーマンス ([docs/concept/ideas](../concept/ideas/README.md) 参照)。

パフォーマンスに関する記述が [docs/concept](../concept/README.md) 配下へ分散していたため、判断基準と個別事例をここへ集約する。

## `useState` を使うかの判断

`useState` は state が変わるたびに component を再レンダリングさせる。値の性質を見極めずに `useState` へ置くと、見た目に関与しない変化でも再レンダリングコストを払う。

### 基準

- **見た目 (JSX の出力・レイアウト) に直接効く値** → `useState` で持つ。
- **`useFrame` 内でのみ読み書きし、Three.js オブジェクトへ反映するだけの値** → `useRef` で持つ ([.claude/rules/react/r3f-state.md](../../.claude/rules/react/r3f-state.md))。
- **他 component から購読される内部状態** → zustand vanilla store + selector 購読で、実際に参照する component のみ再レンダリング対象にする ([component-input-layers](../concept/implementation/component-input-layers/README.md))。
- **外部への通知だけで自身の表示に関与しない値** → event 発行 ([event-driven-ui](../concept/implementation/event-driven-ui/README.md)) や ref で足りる。

### グレーゾーン: 値の一部の変化だけが UI に効く

「累積値がしきい値を超えたら表示を切り替える」のように、値そのものは頻繁に変わるが UI へ効くのは境界をまたぐ瞬間だけ、というケース。値全体を `useState` へ置くと全変化で再レンダリングされる。

- 派生した boolean (しきい値超え判定) のみを state 化し、累積は ref で持つ。
- 累積の更新時に、境界を通過した時だけ `setState` する。

## 個別事例

- [home-box-bot-interaction/](home-box-bot-interaction/README.md) — トップページ box-bot の操作 state が UI を再レンダリングさせる
