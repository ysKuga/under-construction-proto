# time-control-03 stores/context 再編 フォローアップ

## 目的

`20260812-time-control-03-stores-context-restructure` (store 単位ディレクトリ再編 PR) には含めなかった、後続で検討する項目をまとめる。

## 背景・制約

- 元 PR で store 実装を `_stores/<name>/{types.ts,constants.ts,store.ts,context.tsx,index.ts}` に再編済み
- 元 PR の内容・決定事項は `20260812-time-control-03-stores-context-restructure/design.md` 参照

## 実装計画

- [ ] デフォルト値 getter 化の検討
  - 現状、`DEFAULT_ACTOR_SETTINGS`/`DEFAULT_ACTOR_INFO`/`DEFAULT_PATH` 等のデフォルト値定数は、component 側で `state.xxxById[id] ?? DEFAULT_XXX.yyy` の形で直接 import して使う実装が各所に見られる (`_components/actor-controller/index.tsx` 等)
  - component が store 内部のデフォルト値定数に直接依存する形になっており、定数の値・構造が変わると呼び出し側の import・フォールバック記述も影響を受ける
  - 対応案: `_stores/<name>/` 側に「デフォルト値込みで値を取得する getter」(例: `getActorSettings(state, actorId)`) を定義し、component 側はデフォルト値定数を import せず getter 経由で値を取得する形にする
  - 対象: `actor-settings`/`actor`/`path`/`planned-path`/`position` 等、デフォルト値定数を持つ store 全般
- [x] ~~ESLint (`import/no-restricted-paths`) による参照経路ルールの機構化~~ → 見送り

## 決定事項

- ESLint (`import/no-restricted-paths`) による機構化は見送り。参照経路ルールは規約運用のまま継続
- 本フォローアップは「デフォルト値 getter 化の検討」から着手

## 懸念・リスク

- 参照経路ルールが規約運用のみのため、レビュー時の見落としリスクは残ったまま (見送り済み、暫定リスクとして認識)
