# hex-stage の調整スライダーの外出し

PR: #371（親: #357）

## 目的

hex-stage 組込みの調整スライダー群を hex-stage から外し、ステージ・bot の状態表示の下へ置く。

## 背景・制約

- 親 backlog の項目「hex-stage 組込みの調整スライダー群をデバッグ要素へ移す」
  - [../../backlog.md](../../backlog.md)
  - 置き場はデバッグ要素でなく、ステージ・bot の状態表示の下へ変更
  - (decision-records.md 2026-10-17)
- 外出しの手段は決定済み
  - (../../decision-records.md 2026-10-17 デバッグ要素)
  - (../../decision-records.md 2026-10-17 進め方)
- レイアウト分割（PR #369）に依存する
  - [../pr-369-expedition-split-debug-panel/design.md](../pr-369-expedition-split-debug-panel/design.md)
- 対象: tilt・移動時間・歩行周期上限・脚振り角・体の上下量

## 構成案

- tilt 以外
  - hex-stage の props にする（`initial*` と内部 `useState` を削除）
  - 既定値は hex-stage の `constants.ts` へ `MOTION_DEFAULTS` として置き、store の初期値にも使う
  - `display-settings` store へ値・setter を追加する
  - `stage` content が購読し hex-stage へ渡す
- tilt
  - `Stage07Handle.setTilt` を追加する
  - スライダーが `useStage07HandleRef` 経由で呼ぶ
  - 初期値はページの `constants.ts` へ `INITIAL_TILT_DEG` として置く
- 置き場: `stage-area/_contents/stage-sliders`
  - `stage-area` がステージ・bot の状態表示の行の下へ縦に並べる
- `extraSliders` prop を削除する
- `SLIDER_LABEL_STYLE` はページの `constants.ts` へ移す（`EnergySliders` と共用）

## 懸念・リスク

- 移動時間等の変更で `stage` content が再レンダリングする（決定どおり許容）
