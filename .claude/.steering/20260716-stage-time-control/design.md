# stage-time-control

## 目的

stage 内の時間経過を管理する機構を実装する。\
`stage-04-pathfinding`(#20260716) の「実行」フェーズ(経路に沿った逐次移動)実装で時間管理が必要になったことが発端だが、`docs/concept/ideas/action-phase.md` の5段階フェーズ(企図→予備→実行→成否→事後)全体に関わる汎用機能として独立させる。

## 背景・制約

- 発端: [stage-04-pathfinding/design.md](../20260716-stage-04-pathfinding/design.md) の「実行」フェーズ(逐次移動)に、時間経過を扱う仕組みが必要。
- pathfinding 側はこの機構に依存する形で「実行」フェーズを実装する想定。
- 経路探索固有の話ではなく stage 全体(action-phase.md のフェーズ進行全般)に関わるため、独立 steering として切り出し。
- 根本方針: 「時間が進まなければ何も起こらない」。入力(mousedown 等)が発生しても、それ単体でゲーム内処理は走らせない。まず時間管理の配列(イベントログ)に積み、時間進行時に消費・解釈する。
- 習作対象の状態遷移(drag/click/drop 判定):
  - `Idle` --mousedown(on target)--> `Pressed`(drag 発生)
  - `Pressed` --mouseup--> `Idle`(click 完了)
  - `Pressed` --focusout--> `PressedBlurred`
  - `PressedBlurred` --mouseup--> `Idle`(target 解除、drop 発生)
  - `PressedBlurred` --focus(再取得)--> `Pressed`(mousedown 直後と同状態に復帰)

## 実装計画

- [ ] `EventLog`: 時刻付きイベントログ(`{ time, event }[]` 形式、持ち越し型)。React 非依存、TypeScript のみ
- [ ] mousedown/focusout/mouseup による drag/click/drop 状態機械(習作)。生 DOM イベントを `EventLog` に積み、時間進行時に解釈する形で実装
- [ ] ターン制/リアルタイム切替・速度指定・加速は設計方針の検討に留め、実装は次段階以降(今回スコープ外)

## 決定事項

- 時間管理の配列は「時刻付きログ」として持ち越し型で設計。tick を戻して再生すれば巻き戻し、tick 進行速度を上げれば早送りが後から自然に実現できるため。
- 初期実装は React 非依存、TypeScript のみ。
- 入力状態機械(mousedown/focusout/mouseup)は time-control 設計に含める。ただし今回は習作としてこの状態機械(drag/click/drop 判定)の実装に範囲を限定する。ターン制/リアルタイム切替・速度指定・加速は設計方針の検討のみ、実装対象外。

## 懸念・リスク

- 巻き戻し・早送りは今回設計対象外。方針検討のみ行い、実装は次段階以降。
- ターン制/リアルタイム両対応を1機構に抽象化する場合、over-engineering にならないか要検討(YAGNI)。
- 生 DOM イベントをそのまま `EventLog` に積むか、正規化してから積むかは実装時に決定。
