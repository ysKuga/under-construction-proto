# samples box-bot-3d の Assembly 依存の見直し

- 親 issue: #108 (`../../design.md` の「Assembly 依存の見直し」節)
- PR: #128
- base: main

## 目的

`samples/figure/box-bot/_components/box-bot-3d` の設置領域ラッパーを `Assembly` コンポーネント
(`@/components/ad/molecules/assembly`、`ui-container` + `ui-assembly` の 2 重 div、`aspect-square`
固定) から素の div へ置き換え、`Assembly` への依存を断つ。

## 方針の切り分け (2026-09-01 ユーザー確認)

当初 design.md の記述は方向が逆だった。正しくは:

- **theater 配下 (box-bot-01)**: Assembly 依存を **維持**。ゲーム内要素として他 UI と組み合わせて
  表示するため、正方形の設置領域を与える Assembly はむしろ有用。`canvasWidth` / `canvasHeight` は
  `Assembly` を残したまま子 div 側で吸収済み。→ このブランチでは触らない。
- **samples 配下**: デモ用途で Assembly 排除を検討していた対象。box-bot-3d は Canvas +
  `canvasWidth` / `canvasHeight` を持ち、`aspect-square` 固定と噛み合わない。→ 本 PR の対象。

## 背景・制約

- box-bot-3d の現状: `<Assembly style={{ ...style, height: assemblySize, width: assemblySize }}>` を
  ルートに敷き、その中へ `<Canvas>` を `position: absolute` + `translate(-50%, calc(-50% + offset))`
  で直接配置 (box-bot-01 のような `displayAreaRef` ラッパー div は無い)。
- `Assembly` は `ui-container aspect-square relative` の外側 div + `ui-assembly aspect-square h-full
  relative` の内側 div。内側 `h-full` = 外側と同寸のため、Canvas の positioning context は
  外側 div へ畳んでも不変。
- `ui-container` はリポジトリ全体で「UI 領域マーカー」として使われる class (stage / time-control 等)。
  CSS 定義は無い。→ 設置領域 div には残す。`ui-assembly` は内側ラッパー専用 → 廃止。
- `Assembly` は既に `style` で height/width を明示しているため `aspect-square` は冗長。
- `assemblySize` / `heightPx` / `canvasHeightPx` / `effectiveFov` / `verticalOffsetPx` の算出は不変。
  DOM 構造だけの差し替え。

## 実装計画

### 1. `box-bot-3d/index.tsx` の DOM 差し替え

- `import { Assembly } from '@/components/ad/molecules/assembly'` を削除、
  `import { cn } from '@/utils/cn'` を追加 (外部 import グループの後)。
- ルート:

  ```tsx
  <div
    className={cn('ui-container', 'relative', className)}
    style={{ ...style, height: assemblySize, width: assemblySize }}
  >
    <Canvas ... />   {/* 現状のまま。position: absolute で設置領域 div 基準に中央寄せ */}
  </div>
  ```

- コメント / JSDoc 内の「Assembly」表記 → 「設置領域」へ (`assemblySize` 変数名は据え置き)。

### 2. 親 design.md 更新

- 「Assembly 依存の見直し」節を方針切り分け + samples 実装済みへ。「用語」の設置領域定義・
  「決定事項」へ追記。

## 確認

- Storybook で samples box-bot の 3D 系 story (Mode3D / Fall / Grid3D / FullWidth / Circle /
  Walking 等) が従来どおり表示・動作すること。設置領域 (正方形) 基準に Canvas がはみ出す
  レイアウト、`canvasWidth` (FullWidth) / fov スケール (Grid3D / Circle) の挙動が不変。

## 非対象

- `samples/figure/robot-01`: 純 2D の % パーツ配置デモ。正方形固定の Assembly がそのまま適切
  (Canvas / `canvasWidth` の分離要求なし)。`Robot01Props = Omit<AssemblyProps, 'children'>` の
  型依存もあり、外す動機がない。
- `@/components/ad/molecules/assembly` 本体、他 prototypes の `ui-container` 使用、theater 配下
  box-bot-01。
