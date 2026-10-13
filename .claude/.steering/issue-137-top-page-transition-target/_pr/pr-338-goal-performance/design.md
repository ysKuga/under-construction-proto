# ゴール演出のまとめ

PR: #338（親: #137 backlog「ゲームフェーズを導入し、ゴール固有の分岐をまとめる」）

## 目的

- find-path proto-03 のゴール演出を `_contents/goal-performance/`（仮）へまとめる
- 演出の起点をフェーズ `cleared` への遷移に統一する
- 挙動は変えない（リファクタ）

## 背景・制約

- #337 でゴール到達の判定を game-phase store へ置き換えた（[#337](../../_closed/pr-337-game-phase/design.md)）
- ゴールの演出は現状3箇所に散っている
  - 頭上の旗: `_contents/goal-flag-overhead`
  - 両手上げ: `stage-area/_contents/stage/_hooks/use-effect-raise-arms-on-goal-flag`
  - 床上の旗を消す処理: `_layers/goal-marker-layer`（`phase === 'cleared'` で透明化）
- 両手上げの hook 名は旗基準（`OnGoalFlag`）で、起点（フェーズ `cleared`）と合っていない

## 方針

- 対象
  - `_contents/goal-flag-overhead`
  - `stage/_hooks/use-effect-raise-arms-on-goal-flag`
  - `_layers/goal-marker-layer` の床上の旗を消す処理
- 起点はフェーズ `cleared` への遷移に統一する
- `use-effect-raise-arms-on-goal-flag` はフェーズ基準の名前へ改名する

## 懸念・リスク

- 床上の旗の透明化は goal-marker-layer の描画に組み込まれている。goal-performance 側からどう制御するか（分離の仕方）は要検討
