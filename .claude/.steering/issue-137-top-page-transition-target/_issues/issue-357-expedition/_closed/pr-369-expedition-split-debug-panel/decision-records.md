# 決定事項（expedition のレイアウト分割）

- 2026-10-17: 親 backlog の項目「レイアウトを基本構成とデバッグ要素へ分ける」を PR #369 として着手した
  - 開閉は `<details>` で実装する（state を持たずに済むため）
  - 状態表示 content の名前は `status-panel`
- 2026-10-17（実装）: 計画項目を実装した
  - Storybook の `Debug` story で配置・開閉・EN スライダーを確認した
  - `Default` story にデバッグ要素が出ないことを確認した
- 2026-10-17（状態表示）: `ControlPanel` の状態表示を削除した（一度 `status-panel` として新設した後）
  - 対象: ゴール到達表示・中継点数・`WaypointSelectingIndicator`
  - 理由
    - 表示位置がページ下部で不自然
    - ゴール到達は手数の履歴・旗で、中継点はステージ上の 📍 で足りる
  - 中継点選択の「完了」操作は無くなる
  - 操作中の表示を行う場合は、整理した上で別途対応する
  - 親 decision-records.md 2026-10-17（デバッグ要素）の「`WaypointSelectingIndicator` を基本構成に残す」を変更
- 2026-10-17（タイトル）: 画面表示のタイトル（`_contents/title`）を削除した
  - ユーザー判断。画面構成の見直し（親 backlog）に先立ち、本 PR で行う
  - 親 decision-records.md 2026-10-17（デバッグ要素）の「`Title` を基本構成に残す」を変更
