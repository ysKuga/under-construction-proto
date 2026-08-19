# docs/concept/implementation/event-driven-ui

UI (部品) とロジックの分離について。`docs/concept/README.md` の「疎通」節の詳細。

## 課題

component/hooks の分離だけでは「部品」と「全体構造への依存」は分離されない。

- 例: 全 store 一括 reset のような全体機能が、リーフ部品配下の hook に実装され、そこから全 store を直接 import する構造になりがち
- component/hooks 分離は「JSX とロジック」の分離であって、「部品」と「全体構造 (どの store が存在するか) への依存」の分離にはならない
- 移植時、この手の hook ごと全 store 依存を引き連れることになる

## 方針: CustomEvent + EventListener による event 駆動化

部品を「処理を行うもの」ではなく「処理を行うよう通知を出すもの」として実装する。

- 例: 「リセットボタン」は「リセット処理を行う」のではなく「リセット処理を行うよう通知を出す」だけにする
- 依存方向が逆転する。「どの store が存在し何をするか」を知る責務は、通知の発行側 (部品) から購読側 (各 store・上位 hook) へ移る

### EventTarget の分離単位

同一部品の複数 instance・他部品との名前衝突を避けるため、`window`/`document` へのグローバル dispatch + detail 内 identifier での filter (`useId` 等によるユニーク化) ではなく、**scope (部品1 instance) 専用の `EventTarget` instance** を context 経由で配布する方式を採る。instance 自体が scope 分離済みのため、購読側での filter 処理・ユニーク化が不要になる。

### hooks 構成

- 汎用実装: `src/hooks/use-event-listener.ts` / `use-event-dispatcher.ts` (`target` 省略時 `window` デフォルト、`EventTarget` 指定可能)
- プロトタイプ固有のラッパー: 対象部品配下に `_stores`/`_components`/`_contexts` と同列の `_event-hooks/` を設け、冗長な引数指定を隠すラッパー hook・イベント dictionary 型をまとめる

## プロパティとロジックの分離

「プロパティ (部品の所有物)」は event 化の対象外とし、部品への紐づけを保つ。HTML の `input` の `value` が分かりやすい例。プロパティは context + store の実装で部品内部のやり取りをしやすくし、カスタムイベントへの payload もそこから組み立てる。

## トレードオフ・懸念

event 駆動化は移植容易性と引き換えに、「通知発行で何が起きるか」を静的解析 (grep 等) で追いにくくする。副作用の一覧性 (現状は 1 箇所の hook を見れば reset 対象が一目瞭然) とのトレードオフ。型安全性はイベント dictionary 型で担保する。

## 関連

- 検討の発端: `.claude/.steering/20260812-time-control-02-backlog/design.md` 実装計画3 (Custom Event 経由の疎結合化)
- 実装計画・決定事項: `.claude/.steering/20260813-event-driven-decoupling/design.md`
- 実装例: `src/prototypes/time-control/time-control-03/README.md`
