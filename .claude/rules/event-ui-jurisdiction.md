# UI と処理の役割分担

インタラクティブな UI 実装時、UI は担当範囲の情報(クリックしたセル等)の発行のみ。\
分類・実行可否の判定は listener 側。

- UI: event 発行のみ。分類(現在セル・移動可・不可等)・ゲーム要素(EN 等)の判定 持たない
- listener: 分類・判定。必要なデータは自身で取得
- 実行拒否: cancelable event + `preventDefault()`、dispatcher の戻り値で判定
- 処理から UI への命令: imperative handle(`Stage07Handle.moveTo` 等)。拒否は戻り値で返す
- 表示と分類で共有する判定: 汎用 UI 側の `_lib` へ置き双方から import(汎用 UI は呼び出し側を import しない)

詳細・実装例(find-path proto-03 のセルクリック集約)は [ui-jurisdiction](../../docs/concept/implementation/ui-jurisdiction/README.md) 参照。
