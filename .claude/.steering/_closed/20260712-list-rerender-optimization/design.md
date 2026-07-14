# list-rerender-optimization

## 目的

`src/prototypes/rendering/` で「リスト表示で、いずれかの要素が変更 (名前変更など) された際、変更対象要素のみ再描画する」実装を検証する。stage-04 の残課題「操作のたびに stage 全体が再レンダリングされている」の解決策の proof-of-concept として着手。独立したコミットしない施策 (stories として作成、検証後は git 管理下に置かない)。

## 背景・制約

- 依頼: 「変更対象要素のみ再描画される実装を作りたい。独立したコミットしない施策として stories を作成する」
- 検証手段: Storybook (目視) + jsdom + @testing-library/react の一時テストファイル (`__verify__.test.tsx`)。確認後は毎回削除 (コミットしない方針のため)
- vitest 実行時、標準の `vitest.config.ts` に `NEXT_PUBLIC_API_URL=http://localhost:3000` を渡せば動く。setupFiles を外した一時 config は不要 (一度不要な回り道をした、個人 memory にも記録: `vitest-temp-verify-env`)
- `__mocks__/zustand.ts` は `create`/`createStore` のみモック、`useStore` は未対応。zustand vanilla store + `useStore` パターンのテストは `vi.unmock('zustand')` が必要

## 実装計画

- [x] list-01: useState + memo で「変更要素のみ再描画」を検証 (入れ物自体の再描画が残課題と判明)
- [x] list-01 削除 (ユーザー判断)
- [x] list-02: zustand vanilla store + Context で「入れ物」の再描画も抑止
- [x] list-02 拡張: 行追加機能 (ids/byId 分離、構造変更時のみ入れ物が再描画される設計)
- [x] AddItemForm: uncontrolled input 化、タイピング連打時の再描画を根絶
- [x] Highlight updates の信頼性検証 (DevTools 表示と console.log ベースの実測の食い違いを切り分け)

## 決定事項

### list-01 → list-02 の設計転換

- list-01: `List01` コンポーネント自身が `useState` で items を保持。`ListItem` を `memo` + イミュータブルな配列更新 (変更要素のみ新オブジェクト化) でラップすることで、**変更要素のみ再描画**は実現できた。
- しかし `List01` (入れ物) 自体は `setItems` のたびに関数が再実行される。React の原則上、state を持つコンポーネントは更新のたびに必ず再実行されるため、これは `useState` を使う限り不可避。`useReducer` に変えても同じコンポーネント内 state である限り解消しない。
- 解決策: state を **zustand vanilla store** (`createStore`) に外出しし、Context 経由で store インスタンス (不変の参照) のみを配布する。`List02` 自体は store を購読しないか、購読する場合も「変化しない部分」だけを選択的に購読することで、再描画を制御できる。

### list-02 の normalized state 設計

```ts
type ListState = {
  ids: string[]
  byId: Record<string, ListItemData>
  renameItem: (id: string, name: string) => void
  addItem: (item: ListItemData) => void
}
```

- `ids` (リスト構造) と `byId` (要素本体) を分離。
- `renameItem` は `byId` のみ更新 → `ids` の参照は不変 → `ids` を購読する `List02` は名前変更で再描画されない。
- `addItem` は `ids` を新しい配列に置き換える → `ids` を購読する `List02` は行追加時のみ再描画される。これは新規 JSX 要素をツリーに挿す以上避けられない (Reactの原則)。ただし既存の `ListItem` は `memo` のおかげで `id` (不変 props) により再描画されず、新規追加分のみレンダーされる。
- 各 `ListItem` は `useListStore(state => state.byId[id])` で自分の分だけ直接購読。`renameItem` も直接呼ぶため、`List02` 経由の props バケツリレーが不要。

### AddItemForm の uncontrolled化

- 当初 `useState` + `value`/`onChange` の controlled input だった。タイピングのたびに `AddItemForm` 自体が再描画されるのは自然な挙動だが、「連打で再描画が連続するのを防ぎたい」という要望に対応するため `useRef` の uncontrolled input に変更。
- submit 時のみ `inputRef.current.value` を読んで `addItem` を呼び、`inputRef.current.value = ''` で DOM を直接クリア。タイピング中は React の再描画が一切発生しない (ブラウザネイティブの input が自前で値を保持する)。

### Highlight updates の信頼性 (誤解しやすい重要な知見)

- React DevTools の "Highlight updates when components render" は、実際のコンポーネント関数実行 (真の再描画) より **粒度が粗い**。
- `React.memo` でバイルアウトする場合でも、Fiber の reconciliation 処理 (props 比較のための `beginWork` 通過) 自体は発生することがあり、DevTools はこれを拾って highlight することがある。
- 確実な判定手段は `console.log` をコンポーネント本体の先頭に置くこと (関数が実際に実行されれば必ず出力される)。
- 実際の調査過程: 「input 入力中に ListItem 群も highlight される」という報告があったが、console.log ベースの検証 (jsdom + 実ブラウザ両方) では入力中は `AddItemForm` のログしか出ず、`ListItem` のログは一切出なかった。→ DevTools の表示上の癖であり、実際の再描画は発生していないと確定。
- **今後、React の再描画有無を判定する際は Highlight updates を一次情報にせず、console.log か Profiler タブの実測 (render time / did-not-render 記録) で裏取りする。**

## 懸念・リスク

- `src/prototypes/rendering/list-02/` はコミットしない方針の検証コード。正式に本実装へ反映する場合は、stage-04 などの本番プロトタイプへ設計パターンを移植する形で再実装する必要がある (list-02 のファイルをそのまま昇格させない)。
- normalized state (ids/byId 分離) は要素の追加・変更のみ検証済み。削除・並べ替えは未検証。
