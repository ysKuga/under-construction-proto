# proto-03 へ seed 入力・再生成を組み込む

PR: #319（親: #315）

## 目的

proto-03 の盤面を `generateStage` で seed から生成する。
seed の入力と再生成（新しい seed での生成）を UI から行えるようにする。

## 背景・制約

- 親 design: [../../design.md](../../design.md)「基本構成案」
- 前段
  - #316: 配置を `StageLayout` 化し `StageLayoutProvider` で配っている
  - #318: `generateStage(seed, params)`。試行上限超過時は `undefined`
- 現状
  - `index.providers.tsx` が `DEFAULT_STAGE_LAYOUT` を固定で渡している
  - `INITIAL_ITEMS`・`initialActors` もモジュールレベルで `DEFAULT_STAGE_LAYOUT` から組み立てている
  - `ResetProvider`（最外）が配下を `key` で丸ごと再マウントする
- 再マウントで配置を差し替える方針（親 design）

## 基本構成案

- seed を `ResetProvider` の外側で保持し、seed 変更時も配下を再マウントする
  - リセットは同じ seed のまま再マウントするため、盤面は同じ配置へ戻る
- seed → `generateStage` → `StageLayout` を Provider 群へ渡す
  - `INITIAL_ITEMS`・`initialActors` は layout から組み立てる形へ変える
- 生成失敗（`undefined`）時は `DEFAULT_STAGE_LAYOUT` へフォールバックする
- UI: control-panel へ seed 入力欄と「再生成」ボタンを追加する
- 生成条件（`GenerateStageParams`）は定数で持つ

## 懸念・リスク

- 生成盤面の到達性は障害物・一方通行のみ検証済み。EN 不足で詰む盤面が出うる（親 backlog「EN 込みの到達性検証」）
