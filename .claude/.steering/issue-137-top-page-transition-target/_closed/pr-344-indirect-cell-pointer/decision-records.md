# 決定事項（目標設定になるマスの pointer を挙動に揃える）

## 2026-10-16

- pointer は現在マス以外の全マスへ付ける。障害物も含める（クリックで到達不能の通知が出るため）
- セルクリック判定の分散（props drilling 等）は本 PR で扱わず、マージ後に event 化で対応する（[親 decision-records](../../decision-records.md) 2026-10-16）
