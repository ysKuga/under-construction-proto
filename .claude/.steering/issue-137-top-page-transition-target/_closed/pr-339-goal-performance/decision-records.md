# 決定事項（ゴール演出のまとめ）

## 2026-10-13

- #337 がマージ済みのため、ブランチ・PR base とも main にする（当初予定は 137-game-phase ベース）
- 検討段階の steering は挟まず、本 PR から着手する（着手確定済みのため）
- 床上の旗は消す判定だけを `_game-phases/cleared` の hook へ移し、描画は goal-marker-layer に残す
  - 理由: div ごと移すと floor 配置・visibility registry・memo との結合まで動く。ref 経由の DOM 直書きは `cleared` が一度きりのため利点が薄い
- #338 は steering 文書のみでマージされたため、実装は #339 で行う。steering は `pr-339-goal-performance` へ移す
- まとめ先を `_contents/goal-performance` から `_game-phases/cleared` へ変更
  - 理由: 意図は見た目（ゴール演出）でなく、起点のフェーズに紐づく処理をまとめること。今後のフェーズ（詰み等）も `_game-phases/` へ並べる
  - layer → contents の逆向き依存も解消（`GoalMarkerLayer` は `_stores` と同じく下位の共有モジュールとして参照）
  - `_stores/game-phase/` 配下には置かない（store ディレクトリは実装のみ）
- 構成: `_game-phases/cleared/` 直下に `ClearedPhase`、頭上の旗は `_components/flag-overhead`（`FlagOverhead` へ改名）、hook は `_hooks/`
- 両手上げの hook は `useEffectRaiseArmsOnPhaseCleared` へ改名。呼出元を `useStage` から `ClearedPhase` へ移す
- 床上の旗を隠す判定は `useGoalFloorFlagHidden`。`_game-phases/cleared/index.tsx` から export し `GoalMarkerLayer` が呼ぶ
- 3つの演出とも起点はフェーズ `cleared`（両手上げは遷移の購読、旗2つは `phase === 'cleared'` の購読）
