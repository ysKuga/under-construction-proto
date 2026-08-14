# event-dispatcher-object-form

## 目的

`useTimeControl03EventDispatcher` の呼出箇所 (`dispatch('reset-all')`) で、イベント名の意味 (JSDoc) をホバー1発で確認できるようにする。`.claude/.steering/20260813-event-driven-decoupling` で確立した `_events` 構成の上に乗る、reset-all 実装の微修正。

## 背景・制約

- `dispatch<K extends keyof TimeControl03EventMap>(type: K, ...)` の `type` は union literal。`TimeControl03EventMap` のキーに JSDoc を付けても、呼出側の文字列リテラル (値位置) にはホバーで継承されない (TS の制約)。Go to Definition では追えるが 2 step かかる。
- grep での実処理追跡 (`'reset-all'` で検索して listener を探す) も、実装が他ドメインへ一般化した際に同一文言・別ドメインの実装と衝突しうる懸念がある。

## 実装計画

- [x] 対案検証: `TimeControl03EventNames` 定数オブジェクト経由 (`dispatch(TimeControl03EventNames.resetAll)`) を試作 → 動作確認後、一旦差し戻し
- [x] mapped type 経由でも JSDoc がホバーに継承されるか `ts.createLanguageService` の `getQuickInfoAtPosition` で実地検証 → 継承されることを確認
- [x] `useTimeControl03EventDispatcher` の戻り値を関数から `{ [K in keyof TimeControl03EventMap]: (detail?) => void }` 型のオブジェクト (Proxy 実装) に変更
- [x] `useResetAll` の呼出を `dispatch('reset-all')` → `timeControl03EventDispatcher['reset-all']()` に変更
- [x] hooks 変数命名規則 (`useXxx()` → `xxx`) を厳密適用し、変数名を `dispatch` → `timeControl03EventDispatcher` に変更 (useReducer の分割代入パターンとは形式が異なるため例外扱いしない)
- [x] `_events/README.md` を新設し、構成・拡張手順・依存関係・参照ルールを記録

## 決定事項

- **JSDoc をホバー1発で見せる方法として dispatcher オブジェクト化を採用**。理由: `dispatcher['reset-all']()` は値ではなくプロパティアクセス式であり、mapped type 由来でも TS はプロパティ由来の JSDoc をホバーに継承する (実地検証済み)。個別イベントごとの手動実装は不要、`TimeControl03EventMap` にキーを足せば型・JSDoc とも自動で揃う。
- **参照の一意性 (grep 衝突回避) は今回のスコープでは解決していない**。`TimeControl03EventNames` 定数オブジェクト案 (`TimeControl03EventNames.resetAll` という一意な識別子で grep できる) は検証目的で試作したが、JSDoc 継承の問題を dispatcher オブジェクト化だけで解決できると分かったため差し戻した。生文字列 `'reset-all'` は `TimeControl03EventMap` のキーとして依然残る。
- **Proxy 実装を `useMemo` でラップし安定参照化**。素の Proxy を毎レンダリング生成すると `useEventDispatcher` (`useCallback` でメモ化済み) の安定性が失われるため、依存を `[dispatch]` にした `useMemo` で包んだ。
- **hooks 変数命名規則の適用範囲を明確化**。`const dispatch = useReducer(...)` のような配列分割代入は既存ルールの「複数プロパティ分割代入」の対象外規定に該当するが、`const dispatch = useTimeControl03EventDispatcher()` は単一戻り値を直接受ける形式のため規則の本則が適用される、と整理した。

## 懸念・リスク

- grep 衝突回避 (イベント名の一意な識別子化) は未解決のまま。他ドメインへの event 基盤展開時に再検討が必要になる可能性がある。
- listener 側 (`useTimeControl03EventListener` / `use-reset-all-listener`) は今回未変更。dispatcher 側とインターフェースの対称性が崩れている (dispatch はオブジェクトアクセス、listen は引数渡しのまま)。揃えるかどうかは別途判断が必要。
