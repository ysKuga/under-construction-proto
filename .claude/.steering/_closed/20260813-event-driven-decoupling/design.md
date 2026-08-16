# event-driven-decoupling

## 目的

component/hooks 分離だけでは解決しない「部品への全体依存」を、CustomEvent + EventListener によるイベント駆動化で解消する。部品(component)が「何が起きるか(=どの store が存在し何を呼ぶか)」を知らない構造にし、他画面・他プロジェクトへの移植を容易にする。

## 背景・制約

- 現状 `time-control-03/_components/action-bar/_hooks/use-reset-all.ts` が典型例。`ActionBar` 配下の hook が `useActorStore` `useActorSettingsStore` `useGameClockStore` `usePathStore` `usePlannedPathStore` `usePositionStore` を直接 import し、reset をまとめて呼んでいる。
- component/hooks 分離は「JSX とロジック」の分離であり、「部品」と「全体構造(store 一覧)への依存」の分離にはなっていない。
- 移植時、この手の hook ごと全 store 依存を引き連れることになる。
- `src/prototypes/CLAUDE.md` の昇格ルール(`time-control-01 → 02 → 03` のように版を重ね、固まった実装は `time-control/_lib/` へ昇格)に従う。今回は「time-control-04 作成のタイミングで昇格」を具体的トリガーとする。

## 実装計画

第一弾 (reset-all のみ、PR [#61](https://github.com/ysKuga/under-construction-proto/pull/61)) は完了。

- [x] `src/hooks/use-event-listener.ts` — 汎用 hook。`useEventListener<E extends Event>(type, handler, target = window)`。`src/hooks/use-disclosure.ts` と同じ flat 構成・命名規約に合わせる
- [x] `src/hooks/use-event-dispatcher.ts` — 汎用 hook。`useEventDispatcher(target = window)`、dispatch 関数を返す。`useEventListener` と対になる `useEvent` prefix で統一
- [x] `time-control-03` 側に scope 専用 `EventTarget` を持つ context を用意し、配下へ配布 (`_events/_contexts/scope-event-context.ts`)
- [x] time-control-03 固有のラッパー hook — `useTimeControl03EventListener`/`useTimeControl03EventDispatcher` (`_events/_hooks/_utils/`)。命名は「(1) `_hooks/index -> index.hooks`」ではなく「対象名 (`TimeControl03`) を prefix にした具体名」に変更、詳細は決定事項参照
- [x] `TimeControl03EventMap` (カスタムイベントの dictionary 型)を定義し、ペイロード型を一元管理 (`_events/index.types.ts`)
- [x] `action-bar` の `useResetAll` を、reset-all イベントの dispatch のみに置き換え
- [x] reset-all の購読・全 store reset 実行 (`_events/_hooks/use-reset-all-listener/`)。`ScopeEventProvider` (`StoresProvider` の内側に配置) が `ScopeEventListeners` 経由でまとめて有効化する構成に決着、詳細は決定事項参照
- [x] **他 events (reset-all 以外のパターン) への移行は別 PR で実施する**。今回の PR は reset-all の疎結合化のみに限定し、`_events` の構成パターンを確立することを目的とした → 全8イベント移行完了 (PR #60〜67)

## 決定事項

- **EventTarget 方式は「scope 専用 instance」を採用**(案A: window/document + detail 内 scopeId で filter は不採用)。理由: instance 自体が scope 分離済みになるため、listener 側での filter 処理や `useId` によるユニーク化が不要になる。同名イベント(`reset-all` 等)を他部品・同部品の別 instance で使い回しても衝突しない。
- **useId によるユニーク化の適用範囲**: `time-control-03` 全体を1部品として捉え、他部品でも同名イベントを使う可能性が高いため、instance 単位(= EventTarget の分離)でユニーク化したい、という意図。`reset-all` 自体(1回で全部リセットする用途)への `useId` 適用は不要と結論。
- **汎用 hooks は `src/hooks/` に配置**。既存 `use-disclosure.ts` と同じ flat 構成・1 hook = 1 file パターンを踏襲。`target` は省略時 `window` をデフォルトとしつつ `EventTarget` を指定可能にする。
- **命名は `useEvent` prefix で統一**(`useEventListener` / `useEventDispatcher`)。time-control 固有の冗長回避ラッパーは `useEventListenerTimeControl` のように用途名をサフィックスする。
- **プロパティ(部品の所有物)とロジックは別軸で扱う**。HTML の `input` の `value` が分かりやすい例。ロジックは event 化して部品から切り離す一方、プロパティは部品への紐づけを保つ。プロパティは context + store の実装で部品内部のやり取りをしやすくし、カスタムイベントへの payload もこの context/store から組み立てる。
- **配置は当面 `time-control-03` 配下**。`time-control-04` 作成時に昇格するかどうかを判断する運用とする(既存の昇格ルールの具体的トリガーとして採用)。
- **`_events` は自己完結モジュールとして構成**(`index.ts`/`index.contexts.tsx`/`index.hooks.ts`/`index.types.ts` + `_hooks/`、子ディレクトリを持たない)。個別イベントの実装(reset-all 等)は `_events` の外ではなく `_events/_hooks/` 配下に部品 hook として置く(`_stores` の各 store ディレクトリと同様、対象自身の内部実装として扱う)。
  - `_hooks/index.tsx` に `ScopeEventListeners` という component を置き、各購読 hook (`use-reset-all-listener` 等)をここでまとめて呼ぶ。新しい購読を増やす際はここに1行足すだけでよい。
  - `_hooks/_utils/` に `useTimeControl03EventListener`/`useTimeControl03EventDispatcher` の実装を置く(汎用 `src/hooks/` のラッパー)。「hooks を作るたびに utils を作る」という機械的なルールにはせず、基盤が複数ファイルに分かれ束ねる必要がある場合にのみ導入する運用。
- **命名は最終的に `useTimeControl03EventListener`/`useTimeControl03EventDispatcher`/`TimeControl03EventMap` に決着**(検討当初の `useEventListenerTimeControl`/`TimeControlEventMap` から変更)。現段階では time-control-03 専用であることを明示するため、対象名を prefix にした具体名にした。`time-control-04` 作成時に `_lib/` へ昇格するかどうかの判断とセットで、命名の一般化も再検討する。
- **`ScopeEventProvider` は `StoresProvider` の内側に配置**。`ScopeEventListeners` (reset-all 等の購読をまとめて有効化する component) が store の Context を参照する必要があるため。結果として `_events` が `_stores` を import する一方向依存になり、`_stores` は event 実装を一切知らない。
- **Context 定義 (`ScopeEventContext`/`useScopeEventTarget`) は `_events/_contexts/scope-event-context.ts` に分離**。`index.contexts.tsx` (Provider 実装) 自体に置くと、`index.contexts.tsx → _hooks/index.tsx (ScopeEventListeners) → use-reset-all-listener → _hooks/_utils (useTimeControl03EventListener) → index.contexts.tsx` という import 循環が発生する (`eslint-plugin-import` の `no-cycle` で検出済み)。Context 定義だけを独立ファイルに切り出すことで解消した。
- **`_providers/index.tsx`(`TimeControl03Providers`)を新設**し、`StoresProvider`/`ScopeEventProvider` のネストを集約。`time-control-03/index.tsx` 側は `<TimeControl03Providers>` を呼ぶだけになる。
- **`_events` 集約 index からの参照ルール**: `_events` の外部消費者 (`action-bar` 等) は `_events`(集約 index)経由で参照する。`_events` 内部の実装 (`use-reset-all-listener` 等)は集約 index を経由せず `_hooks/_utils/` から直接参照する(集約 index 経由だと上記の import 循環を誘発するため)。

## 懸念・リスク

- **可読性とのトレードオフ**: 現状 `use-reset-all.ts` を見れば reset 対象が一目瞭然だが、event 駆動化すると reset 処理が各 store 側に分散し、「reset ボタン押下で何が起きるか」を静的解析(grep 等)で追いにくくなる。移植容易性と、副作用一覧の集約による可読性、両者のトレードオフとして認識共有済み。今後の実装で許容できる範囲か検証が必要。
- context 経由での EventTarget 配布が前提となるため、`time-control-03` の context 構成への影響範囲を実装時に確認する。
