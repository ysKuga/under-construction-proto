# list-rendering/

リストの再描画最適化の検証を格納する。

- 独立したコミットしない施策として作成 (stage-04 の「操作のたびに stage 全体が再レンダリングされている」課題への proof-of-concept)。
- 検証詳細は `.claude/.steering/20260712-list-rerender-optimization/design.md` 参照。
- 当初 useState 版のプロトタイプ (最初期の試作) も作ったが、下記の課題が判明したため削除済み。以降の説明は現存する list-01 から始まる。

## 「入れ物」の再描画抑止 (list-01)

「変更対象要素のみ再描画」自体は `useState` (親) + `React.memo` (子) + イミュータブルな配列更新で実現できる。\
しかし「入れ物」コンポーネント自体は `useState` を持つ限り、更新のたびに必ず再実行される (React の原則、避けられない)。

解決策: state を zustand vanilla store (`createStore`) に外出しし、Context 経由で store インスタンス (不変の参照) のみ配布する (list-01)。\
子コンポーネントは各々 `useListStore(state => state.byId[id])` で自分の分だけ直接購読する。

## normalized state の設計

- `ids: string[]` (リスト構造) と `byId: Record<id, Data>` (要素本体) を分離する。
- 値変更 (rename 等) は `byId` のみ更新 → `ids` 不変 → `ids` を購読する「入れ物」は再描画されない。
- 構造変更 (追加・削除) は `ids` を更新 → 「入れ物」の再描画は避けられない (新規 JSX を挿す以上、親の関数実行が必須)。ただし既存要素は `memo` により再描画されず、新規/変更分のみ描画される。

## フォーム入力の再描画対策

「頻繁に変化するが親には影響を与えたくない state」(フォームの入力中の値など) は uncontrolled (`useRef`) にする。\
`value`/`onChange` の controlled state だと、入力のたびにそのコンポーネント自身が再描画される。

## useTransition との比較 (list-02)

list-01 の store 構造を流用し、大量要素 (数百件) + 人工的な busy-wait で意図的に重くしたリストで `useTransition` の効果を検証する。\
`addItem` を `startTransition` でラップした版・していない版を Story で切り替え、リストと無関係な `TypingProbe` (独立 input) への入力のカクつきで体感差を確認する。

- `useTransition` は再描画を無くすものではなく、優先度を下げるもの。list-01 の対策 (再描画自体をゼロにする) とは性質が異なる。
- `memo` でラップした子要素は、`addItem` (構造変更) 時も新規追加分しか再描画されない。「入れ物」側の busy-wait でしか大量要素の再計算コストを再現できない点に注意 (`list-02/_lib/busy-wait.ts` の配置箇所を参照)。

## Highlight updates は信用しすぎない

React DevTools の "Highlight updates when components render" は、実際のコンポーネント関数実行より粒度が粗い。\
`React.memo` でバイルアウトする場合でも Fiber の reconciliation 処理自体は発生することがあり、DevTools がそれを拾って highlight することがある。

再描画有無の確実な判定は `console.log` をコンポーネント本体の先頭に置く (関数が実際に実行されれば必ず出力される) か、Profiler タブの実測を使う。
