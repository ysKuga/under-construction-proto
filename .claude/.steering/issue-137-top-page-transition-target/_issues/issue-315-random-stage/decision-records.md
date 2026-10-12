# 決定事項（find-path ステージのランダム生成）

- 2026-10-11: 親 #137 の backlog 項目「find-path のステージをランダム生成する」を、複数 PR にわたるため #315 として切り出した（方針は親 decision-records.md 2026-10-11）
- 2026-10-11: 下準備（`StageLayout` 化）完了（[#316](_closed/pr-316-stage-layout/design.md)）
- 2026-10-11: 生成（seed 付き乱数と `generateStage`）完了。EN 込みの到達性検証は別項目へ切り出した（[#318](_closed/pr-318-stage-generator/design.md)）
- 2026-10-11: 組込み（proto-03 へ seed 入力・再生成）完了。開始・ゴール間の最小距離 `minGoalDistance` も追加した（[#319](_closed/pr-319-stage-seed-input/design.md)）
- 2026-10-11: EN 込みの到達性検証（`canReachGoalWithEnergy`）完了。携行アイテムは任意のタイミングで使える前提（[#322](_closed/pr-322-stage-en-reachability/design.md)）
- 2026-10-11: EN 切れ時のリセットで盤面ごと初期状態へ戻す対応完了。表示設定等の設定系 store も初期化される（[#325](_closed/pr-325-stage-reset/design.md)）
- 2026-10-12: 手数の履歴の記録・表示完了。リセットも履歴へ記録し、表示は直近 20 件に限る（[#326](_closed/pr-326-stage-move-history/design.md)、[#327](_closed/pr-327-stage-move-history-display/design.md)）
