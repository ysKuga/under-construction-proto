# 決定事項（調整スライダーの設定アイコンのポップオーバー化）

- 2026-10-17: ポップオーバーの実装手段を Popover API + CSS anchor positioning にした
  - 理由: 開閉 state・外側クリック処理が不要。新規パッケージ導入も不要
  - `@radix-ui/react-popover` は不採用
