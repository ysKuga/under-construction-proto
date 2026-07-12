# stage-04-actor-move

## 目的

`src/prototypes/stage/stage-04/` として、単純な升目表示とキャラクター移動ロジックを実装する。
GitHub issue #35 (open) の残タスク「layer の串刺しについての context 使用実装」に対応する内容。

## 背景・制約

- stage-01 → 02 → 03 と進化してきたプロトタイプの次段階 (issue #42/#43/#44 は closed)。
- stage-03 の `ActorsLayer` は `rows` を props で受け取らず `cols` で代用するバグを保持。
- `stage/README.md` に構想として「geo context」「actors position context」があったが stage-03 時点で未実装。今回は actors position context のみ実装、geo context はスコープ外。
- `docs/concept/ideas/action-phase.md` の企図・予備・実行・成否・事後 5 段階フェーズ構想のうち「企図 (Intent) → 即時 Resolution」のみを実装。経路探索を含む中間フェーズは将来課題。
- 実装計画ファイル: `/home/yskuga/.claude/plans/tingly-kindling-gadget.md`

## 実装計画

- [x] `_contexts/actor-position-context.tsx`: 位置管理 Context, `MoveIntentEvent` 型, `resolveMoveIntent` (クランプのみ)
- [x] `_components/geo-layer/index.tsx`: 升目表示、セルクリックで直接移動
- [x] `_components/actors-layer/index.tsx`: actor 表示、クリックで順送り移動 (rows バグ修正込み)
- [x] `_hooks/use-keyboard-move.ts`: 矢印キー/WASD 移動
- [x] `index.tsx` / `index.stories.tsx` / `README.md`
- [x] lint (`eslint`) / 型検証 (`tsc --noEmit`) 通過確認
- [x] jsdom + testing-library による実 DOM 動作検証 (キーボード移動+境界クランプ、actor クリック順送り+ラップアラウンド、セルクリック直接ワープ、非正方形グリッド) — 一時テストのため検証後削除済み

## 決定事項

- 位置管理は props バケツリレーではなく Context (`ActorPositionProvider`) を採用。発生源が3つ (キーボード/actor クリック/セルクリック) あり、同じ位置・更新関数を共有する必要があるため。
- 移動企図イベント (`MoveIntentEvent`) は `{ source, target }` の共通型とし、実行部分 (`resolveMoveIntent`) は source で分岐せず「target を安全な範囲にクランプする」単一の仕事に徹する。境界処理の違い (ラップアラウンド/クランプ/ワープ) は各発生源 (producer) 側で target の作り方を変えることで表現。
  - actor クリック: producer 側でラップアラウンド済み座標を算出 (stage-03 の巡回 UX 維持)
  - キーボード: producer 側は現在位置+差分のみ、resolver でクランプ (端で停止)
  - セルクリック: producer 側でクリック座標そのまま (常にグリッド内、実質ノーオペ)
- `_components`/`_contexts`/`_hooks` は stage-04 スコープに閉じ、共有資産化しない (Next.js の `_` prefix 慣習踏襲)。

## 懸念・リスク

1. **全体再レンダリング**: 操作 (移動) のたびに stage 全体が再レンダリングされている。`ActorPositionContext` の value を `position` と `dispatch+gridSize` に分割するなどの最適化が必要。stage-03 の README で見送っていた点と同種の課題。
2. **隣接以外クリック時のジャンプ**: セルクリックで隣接以外のセルを指定した場合、経路探索なしで直接ワープする。計画時点で意図的にスコープ外としたが、将来 `action-phase.md` の予備〜実行フェーズを実装する際に見直しが必要。
