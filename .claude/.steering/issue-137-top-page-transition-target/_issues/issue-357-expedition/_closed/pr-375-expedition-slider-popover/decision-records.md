# 決定事項（調整スライダーの設定アイコンのポップオーバー化）

- 2026-10-17: ポップオーバーの実装手段を Popover API + CSS anchor positioning にした
  - 理由: 開閉 state・外側クリック処理が不要。新規パッケージ導入も不要
  - `@radix-ui/react-popover` は不採用
- 2026-10-17（実装）: 計画項目を実装した
  - Storybook（Default・Debug）でポップオーバーの位置・開閉・値の保持を確認した
  - `stage-sliders` は store を購読するため `stage-settings/_contents/` へ置いた（`_components/` は props 駆動の部品）
  - `motion-sliders`・`energy-sliders` も同じ理由で `debug-panel/_contents/` へ移した
- 2026-10-17（アイコン位置）: 設定アイコンを床の左下へ置いた
  - 経緯: 独立 bot 右上 → ステージ右上 → 床の左下
    - 独立 bot から外した理由: 調整スライダーは bot と関係しない
  - 親 decision-records.md 2026-10-17（調整スライダーの表示）の「位置: 独立 bot 右上」を変更
  - ポップオーバーは左端揃えで開き、セル情報パネルへ重ねる（一旦許容）
  - スライダーは見出しの下へ字下げして置き、幅を詰めた（410px → 223px）
- 2026-10-17（ピン留め）: ポップオーバーにピン留めを付けた
  - ピン留め中は `popover="manual"`（外側クリック・Esc で閉じない）。解除で閉じる
  - ピン留め中に設定アイコンを押すと閉じる。ピン留めは保持し、次に開くとピン留めのまま
