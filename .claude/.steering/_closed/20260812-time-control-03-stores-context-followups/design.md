# time-control-03 stores/context 再編 フォローアップ

## 目的

`20260812-time-control-03-stores-context-restructure` (store 単位ディレクトリ再編 PR) には含めなかった、後続で検討する項目をまとめる。

## 背景・制約

- 元 PR で store 実装を `_stores/<name>/{types.ts,constants.ts,store.ts,context.tsx,index.ts}` に再編済み
- 元 PR の内容・決定事項は `20260812-time-control-03-stores-context-restructure/design.md` 参照

## 実装計画

- [x] デフォルト値 getter 化
  - `actor-settings`/`actor`/`path`/`planned-path`/`position` の5 store、`types.ts`/`store.ts` に `get<Name>(actorId)` メソッド追加 (state 内メソッドとして実装、`get().xxxById[id] ?? DEFAULT_XXX` を返す)
  - component/`_lib`/`_contexts` 側の `state.xxxById[id] ?? DEFAULT_XXX` 直参照を `state.get<Name>(id)` 呼出に置換 (対象: `actor-controller`/`current-position-marker`/`planned-path-marker`/`action-bar`/`stage-transform-context`)
  - `_lib/build-schedule.ts` は `Record<ActorId, ActorInfo>` を丸ごと受け取る純粋関数設計のため対象外 (getter 化するとシグネチャ変更 + テスト5箇所書換が必要になり範囲肥大化するため据置)
  - store 内部 (setter 内・他 store からのクロスストア参照) の既存 fallback はスコープ外のまま維持
- [x] ~~ESLint (`import/no-restricted-paths`) による参照経路ルールの機構化~~ → 見送り

## 決定事項

- ESLint (`import/no-restricted-paths`) による機構化は見送り。参照経路ルールは規約運用のまま継続
- デフォルト値 getter 化: 「getter」は selector 関数ではなく store state 自身のメソッドとして実装 (`getActorSettings(actorId)` 等、内部で `get().xxxById[id] ?? DEFAULT_XXX` を返す)。export 経路は既存 `index.ts` (`export * from './store'`) そのままで対応可能なため、新規集約 index は作成せず
- `stage-transform-context.tsx` の `DEFAULT_POSITION` はコンポーネント内ローカル定義にせず `_stores/position/constants` から直接 import のまま維持 (`useShallow` 購読時、ローカル変数だと毎レンダーで新規オブジェクト参照になり shallow 比較が常に不一致判定される回帰リスクがあったため)
- 型チェック (`tsc --noEmit`)・対象テスト (10 files / 51 tests)・ESLint、いずれも通過確認済み

## 懸念・リスク

- 参照経路ルールが規約運用のみのため、レビュー時の見落としリスクは残ったまま (見送り済み、暫定リスクとして認識)
