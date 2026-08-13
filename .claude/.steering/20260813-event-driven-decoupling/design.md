# event-driven-decoupling

## 目的

component/hooks 分離だけでは解決しない「部品への全体依存」を、CustomEvent + EventListener によるイベント駆動化で解消する。部品(component)が「何が起きるか(=どの store が存在し何を呼ぶか)」を知らない構造にし、他画面・他プロジェクトへの移植を容易にする。

## 背景・制約

- 現状 `time-control-03/_components/action-bar/_hooks/use-reset-all.ts` が典型例。`ActionBar` 配下の hook が `useActorStore` `useActorSettingsStore` `useGameClockStore` `usePathStore` `usePlannedPathStore` `usePositionStore` を直接 import し、reset をまとめて呼んでいる。
- component/hooks 分離は「JSX とロジック」の分離であり、「部品」と「全体構造(store 一覧)への依存」の分離にはなっていない。
- 移植時、この手の hook ごと全 store 依存を引き連れることになる。
- `src/prototypes/CLAUDE.md` の昇格ルール(`time-control-01 → 02 → 03` のように版を重ね、固まった実装は `time-control/_lib/` へ昇格)に従う。今回は「time-control-04 作成のタイミングで昇格」を具体的トリガーとする。

## 実装計画

- [ ] `src/hooks/use-event-listener.ts` — 汎用 hook。`useEventListener<E extends Event>(type, handler, target = window)`。`src/hooks/use-disclosure.ts` と同じ flat 構成・命名規約に合わせる
- [ ] `src/hooks/use-event-dispatcher.ts` — 汎用 hook。`useEventDispatcher(target = window)`、dispatch 関数を返す。`useEventListener` と対になる `useEvent` prefix で統一
- [ ] `time-control-03` 側に scope 専用 `EventTarget` を持つ context を用意し、配下へ配布
- [ ] `time-control-03/_hooks/use-event-listener-time-control.ts` — `useEventListenerTimeControl(type, handler)`。context から scope 専用 EventTarget を取得し `useEventListener` へ委譲する冗長回避ラッパー
- [ ] `TimeControlEventMap` (カスタムイベントの dictionary 型)を定義し、ペイロード型を一元管理
- [ ] `action-bar` の `useResetAll` を、reset-all イベントの dispatch のみに置き換え
- [ ] 各 store 側(または store に紐づく上位 hook)で `useEventListenerTimeControl('reset-all', ...)` を購読させ、自分自身の reset を実行させる
- [ ] time-control-04 作成のタイミングで `useEventListenerTimeControl` / `TimeControlEventMap` を `time-control/_lib/` へ昇格するか判断

## 決定事項

- **EventTarget 方式は「scope 専用 instance」を採用**(案A: window/document + detail 内 scopeId で filter は不採用)。理由: instance 自体が scope 分離済みになるため、listener 側での filter 処理や `useId` によるユニーク化が不要になる。同名イベント(`reset-all` 等)を他部品・同部品の別 instance で使い回しても衝突しない。
- **useId によるユニーク化の適用範囲**: `time-control-03` 全体を1部品として捉え、他部品でも同名イベントを使う可能性が高いため、instance 単位(= EventTarget の分離)でユニーク化したい、という意図。`reset-all` 自体(1回で全部リセットする用途)への `useId` 適用は不要と結論。
- **汎用 hooks は `src/hooks/` に配置**。既存 `use-disclosure.ts` と同じ flat 構成・1 hook = 1 file パターンを踏襲。`target` は省略時 `window` をデフォルトとしつつ `EventTarget` を指定可能にする。
- **命名は `useEvent` prefix で統一**(`useEventListener` / `useEventDispatcher`)。time-control 固有の冗長回避ラッパーは `useEventListenerTimeControl` のように用途名をサフィックスする。
- **プロパティ(部品の所有物)とロジックは別軸で扱う**。HTML の `input` の `value` が分かりやすい例。ロジックは event 化して部品から切り離す一方、プロパティは部品への紐づけを保つ。プロパティは context + store の実装で部品内部のやり取りをしやすくし、カスタムイベントへの payload もこの context/store から組み立てる。
- **配置は当面 `time-control-03` 配下**。`time-control-04` 作成時に昇格するかどうかを判断する運用とする(既存の昇格ルールの具体的トリガーとして採用)。

## 懸念・リスク

- **可読性とのトレードオフ**: 現状 `use-reset-all.ts` を見れば reset 対象が一目瞭然だが、event 駆動化すると reset 処理が各 store 側に分散し、「reset ボタン押下で何が起きるか」を静的解析(grep 等)で追いにくくなる。移植容易性と、副作用一覧の集約による可読性、両者のトレードオフとして認識共有済み。今後の実装で許容できる範囲か検証が必要。
- context 経由での EventTarget 配布が前提となるため、`time-control-03` の context 構成への影響範囲を実装時に確認する。
