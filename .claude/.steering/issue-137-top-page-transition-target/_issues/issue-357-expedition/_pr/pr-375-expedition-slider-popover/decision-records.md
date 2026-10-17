# 決定事項（調整スライダーの設定アイコンのポップオーバー化）

- 2026-10-17: ポップオーバーの実装手段を Popover API + CSS anchor positioning にした
  - 理由: 開閉 state・外側クリック処理が不要。新規パッケージ導入も不要
  - `@radix-ui/react-popover` は不採用
- 2026-10-17（実装）: 計画項目を実装した
  - Storybook（Default・Debug）でポップオーバーの位置・開閉・値の保持を確認した
  - `stage-sliders` は store を購読するため `stage-settings/_contents/` へ置いた（`_components/` は props 駆動の部品）
  - `motion-sliders` は前例 `energy-sliders` に揃え `debug-panel/_components/` に置いた
