# ゴール演出のまとめ

PR: #339（steering 作成: #338、親: #137 backlog「ゲームフェーズを導入し、ゴール固有の分岐をまとめる」）

## 目的

- find-path proto-03 のゴール演出を、起点のフェーズ単位で `_game-phases/cleared/` へまとめる
  - 腕を上げる・旗を上げる等を個別に実装せず、フェーズに紐づく処理として1箇所に集める
- 演出の起点をフェーズ `cleared` への遷移に統一する
- 挙動は変えない（リファクタ）

## 背景・制約

- #337 でゴール到達の判定を game-phase store へ置き換えた（[#337](../pr-337-game-phase/design.md)）
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
- まとめ先はフェーズ単位のディレクトリ `_game-phases/{フェーズ名}/`（入口: `ClearedPhase`）
  - 描画を伴うため `_contents/index.tsx` から置く
- 床上の旗は「消す判定」だけを `_game-phases/cleared` へ移す
  - 判定 hook `useGoalFloorFlagHidden` を export し、goal-marker-layer はそれを呼ぶだけにする
  - 描画・visibility registry 登録・`React.memo` は goal-marker-layer に残す

## 懸念・リスク

なし
