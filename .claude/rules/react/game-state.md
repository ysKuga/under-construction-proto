# ゲームロジック本体の state 方針

actor 移動・進入判定・EN 等 ゲームロジック本体、`useState` 既定回避。`ref` か store 直接購読 優先。

現状 努力目標。既存実装 全面準拠済みでない、新規・改修時 優先的に適用する位置づけ。

## 理由

ゲームロジック 頻繁に値変化。`useState` で持つと React 再レンダリングサイクルに乗り、値と無関係な子 component まで巻込み再レンダリング。find-path proto-03 の `EnergyDebugPanel` 操作で `Stage07` 配下ツリー全体が再レンダリングされていた問題、典型例(issue-181-en backlog、PR #212)。

## 基準

- JSX 出力に直接使う値のみ `useState` 許容
- 他 component から購読される内部状態、zustand vanilla store + selector 購読で実際に参照する component のみ再レンダリング対象にする
- 判断基準・個別事例の詳細は [docs/performance/README.md](../../../docs/performance/README.md) 参照
