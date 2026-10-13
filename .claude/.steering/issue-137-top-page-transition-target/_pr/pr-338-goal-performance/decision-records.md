# 決定事項（ゴール演出のまとめ）

## 2026-10-13

- #337 がマージ済みのため、ブランチ・PR base とも main にする（当初予定は 137-game-phase ベース）
- 検討段階の steering は挟まず、本 PR から着手する（着手確定済みのため）
- 床上の旗は消す判定だけを goal-performance の hook へ移し、描画は goal-marker-layer に残す
  - 理由: div ごと移すと floor 配置・visibility registry・memo との結合まで動く。ref 経由の DOM 直書きは `cleared` が一度きりのため利点が薄い
