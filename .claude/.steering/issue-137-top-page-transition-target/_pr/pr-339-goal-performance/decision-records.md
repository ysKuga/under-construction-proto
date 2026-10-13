# 決定事項（ゴール演出のまとめ）

## 2026-10-13

- #337 がマージ済みのため、ブランチ・PR base とも main にする（当初予定は 137-game-phase ベース）
- 検討段階の steering は挟まず、本 PR から着手する（着手確定済みのため）
- 床上の旗は消す判定だけを goal-performance の hook へ移し、描画は goal-marker-layer に残す
  - 理由: div ごと移すと floor 配置・visibility registry・memo との結合まで動く。ref 経由の DOM 直書きは `cleared` が一度きりのため利点が薄い
- #338 は steering 文書のみでマージされたため、実装は #339 で行う。steering は `pr-339-goal-performance` へ移す
- 構成: `goal-performance/` 直下に `GoalPerformance`、頭上の旗は `_contents/flag-overhead`（`FlagOverhead` へ改名）、hook は `_hooks/`
- 両手上げの hook は `useEffectRaiseArmsOnPhaseCleared` へ改名。呼出元を `useStage` から `GoalPerformance` へ移す
- 床上の旗を隠す判定は `useGoalFloorFlagHidden`。`goal-performance/index.tsx` から export し `GoalMarkerLayer` が呼ぶ
- 3つの演出とも起点はフェーズ `cleared`（両手上げは遷移の購読、旗2つは `phase === 'cleared'` の購読）
