# 揺れの event の改名と選択肢パネルの揺れ

PR: #410（親: #393）

## 目的

拒否の揺れを、bot 頭上の吹き出しでなく選択肢パネルでも知らせる。\
EN スポットの使用・EN 切れの救助をパネルへ移す（後続 PR）前の下準備。

## 背景・制約

- 方針（../../decision-records.md 2026-10-23 選択肢パネルの event 設計）
  - `Expedition-shake-bot-bubble` を `Expedition-action-rejected`（通知型）へ改名する
  - パネル全体を揺らす
- 表示部品 `_components/choice-panel` へ揺れの imperative handle（`shake`）を足す
- 組み合わせ `stage/_components/choice-panel` が event を購読し、handle を呼ぶ
- EN スポット・EN 切れの吹き出しは本 PR では残す。改名後の event で引き続き揺れる

## 懸念・リスク

- パネルが閉じている間の揺れは見えない
