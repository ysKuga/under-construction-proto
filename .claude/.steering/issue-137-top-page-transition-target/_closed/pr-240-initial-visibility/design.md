# マスの初期表示制御

issue: #137 / PR: #240

## 目的

proto-03 で、マスの初期表示状態を以下の3モードから切り替えられるようにする。

- すべて表示
- すべて非表示（現状）
- 部分的に非表示
  - 隣接後は表示
  - 隣接後に離れると再度非表示

## 背景・制約

- 現状の可視判定は `VisibilityRegistryProvider`（`proto-03/_contexts/visibility-registry`）が担う
  - 視界（現在地とその6近傍）→ 表示
  - 到達済み表示ON、かつ到達済みセル → 表示
  - 上記以外 → `display: none`
- 「到達済みマスを表示する」チェックボックス（`setShowVisited`、既定 ON）が既にある
  - ON = 隣接後は表示
  - OFF = 離れると再度非表示
- 可視状態は DOM 直書きで反映し、再レンダリングさせない（[game-state](../../../../rules/react/game-state.md)）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 方針

### 霧セル集合への統一

モードごとに「非表示対象になりうるセル集合（霧セル）」を選ぶだけで3モードを表現する。

- `all-visible`: 霧セル = 空（常に全表示）
- `all-hidden`: 霧セル = 全セル（現状と同じ）
- `partial`: 霧セル = 定数で指定した一部領域。霧セル以外は常時表示

可視判定:

```text
!霧セル.has(cell) || 視界内 || (showVisited && visited.has(cell))
```

### 管理の分離（fog store）

霧の状態・判定を zustand vanilla store（`_stores/fog`）へ切り出す。\
適用・解除をしやすくするため。

- fog store が持つもの
  - モード、到達済み表示の有無、現在地、到達済みセル
  - 可視判定 `isVisible`
  - 操作 `markVisited` / `setMode` / `setShowVisited`
- `VisibilityRegistryProvider` は DOM の登録と反映のみを担う
  - fog store を `subscribe` し、変化時に全登録 DOM を再計算する（再レンダリングなし）
- 適用・解除
  - 実行中の解除は `setMode('all-visible')`
  - 霧の判定ロジックは store と pure function に閉じるため、単体テストしやすい

### 霧セル内の挙動

「隣接後は表示」「離れると再度非表示」は既存の `showVisited` トグルを流用する。

- `partial` 専用にしない
- `all-hidden` / `partial` で共通に効く

### partial の霧セル

- `constants.ts` に固定領域として定義する（例: ゴール周辺）
- 距離基準・ランダム生成は対象外

### 切替

- プレイ中に UI（select）で切り替えられるようにする
- 初期値は `FindPathProto03` の prop で受け取り、story args から渡せるようにする

## 懸念・リスク

- 経路プレビュー（`PathPreviewLayer`）・目標マーカーは元から visibility registry に登録しておらず、視界外も表示される。モードの影響は受けない
- 非表示セルは `display: none` なのでクリックできない。`all-visible` では全セルがクリックでき、非隣接クリック（目標設定）の対象も全域に広がる
