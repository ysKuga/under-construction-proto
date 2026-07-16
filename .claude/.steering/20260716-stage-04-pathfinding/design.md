# stage-04-pathfinding

## 目的

`src/prototypes/stage/stage-04/` の actor 移動に経路探索を導入する。\
セルクリックで隣接以外を指定した場合の直接ワープを解消し、`docs/concept/ideas/action-phase.md` の5段階フェーズ(企図→予備→実行→成否→事後)のうち「予備」「実行」を実装対象に加える。

## 背景・制約

- `stage-04-actor-move`(#20260712)時点では「企図(Intent)→即時Resolution」のみ実装、経路探索は意図的にスコープ外とした。
  - 懸念②(design.md): 「セルクリックで隣接以外のセルを指定した場合、経路探索なしで直接ワープする」
  - [README.md:17](../../../src/prototypes/stage/stage-04/README.md#L17): 「経路探索は将来課題、スコープ外」
  - [actor-position-context.tsx:47](../../../src/prototypes/stage/stage-04/_contexts/actor-position-context.tsx#L47): 「経路探索は行わず、企図イベントの発生源が計算した target をそのまま反映する」
- `resolveMoveIntent` は現状「target を安全な範囲にクランプする」単一責務。経路探索を挟む場合、この責務分離方針(producer が target を作る/resolver はクランプのみ)との整合を要検討。
- 複数 actor 対応(懸念③、次PR扱いのまま未着手)とは独立タスクだが、経路探索実装時に actor 同士の衝突判定が絡む可能性はある→今回はスコープ外、単一 actor 前提で進める。

## 実装計画

- [ ] 経路探索アルゴリズム選定(グリッド上の単純さ優先、BFS想定)
- [ ] 「予備」フェーズ: クリック地点までの経路計算、到達不能判定
- [ ] 「実行」フェーズ: 経路に沿った逐次移動([stage-time-control](../20260716-stage-time-control/design.md) の時間管理機構に依存)
- [ ] `MoveIntentEvent` / `resolveMoveIntent` との統合方針決定
- [ ] 既存の隣接クリック・キーボード移動への影響確認(regression)

## 決定事項

<!-- 検討・決定した内容のログ -->

## 懸念・リスク

- 経路探索を「予備」フェーズに置くか「実行」フェーズ内で都度計算するか未決定。
- 逐次移動時の中間状態(actor が経路上を移動中)を `ActorPositionContext` にどう表現するか未検討。
