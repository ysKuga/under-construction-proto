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
- 到達性の検証: 障害物・一方通行のみ（既存 `findHexPath` + `canEnterForPath`）
  - EN 込みは対象外、親 backlog へ (decision-records.md 2026-10-11)
- 配置先: `_lib/create-random.ts`・`_lib/generate-stage.ts`（テスト同列）

## 懸念・リスク

- 試行上限に達した場合は `undefined`。呼出側の扱い（`DEFAULT_STAGE_LAYOUT` へフォールバック等）は組込み PR で決める
- 開始・ゴールが隣接する等、自明な盤面も生成されうる（難易度制御は親 design の後段方式）
