# 決定事項（調整スライダーの設定アイコンのポップオーバー化）

- 2026-10-17: ポップオーバーの実装手段を Popover API + CSS anchor positioning にした
  - 理由: 開閉 state・外側クリック処理が不要。新規パッケージ導入も不要
  - `@radix-ui/react-popover` は不採用
- 2026-10-17（実装）: 計画項目を実装した
  - Storybook（Default・Debug）でポップオーバーの位置・開閉・値の保持を確認した
  - `stage-sliders` は store を購読するため `stage-settings/_contents/` へ置いた（`_components/` は props 駆動の部品）
  - `motion-sliders`・`energy-sliders` も同じ理由で `debug-panel/_contents/` へ移した
- 2026-10-17（アイコン位置）: 設定アイコンを独立 bot 右上からステージ右上へ移した
  - 理由: 調整スライダーは bot と関係しない
  - 親 decision-records.md 2026-10-17（調整スライダーの表示）の「位置: 独立 bot 右上」を変更
