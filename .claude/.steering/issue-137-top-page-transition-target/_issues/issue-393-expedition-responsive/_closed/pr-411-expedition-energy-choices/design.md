# EN スポットの使用・EN 切れの救助の選択肢パネルへの移設

PR: #411（親: #393）

## 目的

EN スポットの使用・EN 切れの救助を、bot 頭上の吹き出しから選択肢パネルへ移す。

## 背景・制約

- 方針（../../decision-records.md 2026-10-23 選択肢パネル / 選択肢パネルの event 設計）
  - 既存の event（`Expedition-use-energy-spot`・`Expedition-use-item`・`Expedition-reset-to-checkpoint`）をそのまま使う
  - 拒否は `Expedition-action-rejected` で知らせる（PR #410）
- 表示条件は吹き出しと同じ
  - EN 切れ: EN が 0 以下、かつ補給中でない
  - EN スポット: 停止中、かつ補給できる
  - 盤面を操作できるフェーズのみ（`operateStage`）
- 吹き出しは外す。補給中・補給完了（お知らせ）は吹き出しのまま
- 選択肢は `_choices/energy-spot`・`_choices/rescue` として登録する（PR #412 の仕組み）
  - 変えてよいファイル: 各機能の置き場・`ExpeditionChoices` の 1 行のみ（.claude/rules/feature-addition-scope.md）
  - パネル・組み合わせの props・hook の戻り値型は変えない
- 依存: PR #412

## 懸念・リスク

- 「EN 切れ…」の思考吹き出しが無くなる。EN 切れの状態は状態表示の EN のみで伝わる
