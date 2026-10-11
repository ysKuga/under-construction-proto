# 決定事項（ステージ配置の StageLayout 化）

- 2026-10-11: 親 #315 backlog「下準備」を PR #316 として着手。配置はマウント中不変のため store でなく Context の値で配る
- 2026-10-11: 経路探索用の判定は `useCanEnterForPath` hook を新設せず、呼出元 3 箇所で `useStageLayout()` を束縛する（`_hooks` 内の同列 import 回避）
- 2026-10-11: 霧セル（partial）は fog store の `visibleAreaOf(goal)` で組み立てる。`FogStoreProvider` は `StageLayoutProvider` の内側に置く
- 2026-10-11: 実装完了。proto-03 のテスト 119 件・Storybook（配置・障害物拒否・移動・経路プレビュー）で挙動不変を確認
