# seed 付きステージ生成

PR: #318（親: #315）

## 目的

seed から `StageLayout` を生成する純関数 `generateStage` を用意する。
同じ seed で同じ配置を再現でき、生成した盤面はゴールへ到達可能であることを保証する。
proto-03 への組込み（seed 入力・再生成 UI）は本 PR の対象外。

## 背景・制約

- 親 design: [../../design.md](../../design.md)「基本構成案」
- 前段 #316 で配置が `StageLayout` 型・`DEFAULT_STAGE_LAYOUT` にまとまっている
  - `_contexts/stage-layout/types.ts`
- 盤面: `GRID`（5×5、offset）→ axial 変換、範囲判定は `isHexCellInGrid`
- 進入判定は既存 `_lib` を流用する
  - `canEnterForPath`（障害物・一方通行の壁）
- 純関数のみ。React・store に依存しない

## 基本構成案

- 乱数: mulberry32（`seed: number` → `() => number`）
- `generateStage(seed, params) => StageLayout`
  - params: グリッド・各要素の個数等
  - 生成 → 検証 → だめなら次の乱数で再生成（試行上限あり）
- 到達性の検証
  - まず障害物・一方通行のみの BFS で到達可能か
  - EN 込み（`(cell, 残 EN, 取得済みアイテム)` の状態空間探索）は本 PR で扱うか要判断
- 配置先: `_lib/`（`generate-stage.ts`・`random.ts` 等、テスト同列）

## 懸念・リスク

- EN 込み検証はスポットの残量・使用タイミングまで含めると状態空間が膨らむ
- 試行上限に達した場合の扱い（`DEFAULT_STAGE_LAYOUT` へフォールバック等）
- 一方通行の壁で開始・ゴール周辺が閉じる配置の検出
