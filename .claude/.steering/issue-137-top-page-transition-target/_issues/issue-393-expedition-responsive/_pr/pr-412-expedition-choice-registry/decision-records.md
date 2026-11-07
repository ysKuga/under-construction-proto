# 決定事項（選択肢パネルへ選択肢を event で登録する仕組み）

- 2026-11-07: steering を作成した
- 2026-11-07（設計）: 選択肢は store で登録し、選択は event で受け取る
  - パネル（表示部品・ステージの組み合わせ）: 登録済みの選択肢を並べ、選ばれた id を発行するのみ
    - 表示条件・選択時の処理は持たない
  - 登録: `_stores/choices`（`register`・`unregister`）。選択肢は `{ id, label, order, pressed? }`
    - event でない理由: 選択肢の一覧は状態。event だとパネルのマウント前の登録が失われる
    - 並び順: 各選択肢の `order`（登録の順は表示条件の変化で変わるため使わない）
  - 選択: `Expedition-choice-select`（`detail: { id }`）
    - 各機能の listener が `allowMultiple` で購読し、自分の id のみ処理する
    - cancelable にしない（処理が非同期のため）。拒否は各機能が `Expedition-action-rejected` を発行する
  - 機能: `_choices/<機能>/` に 1 hook。表示条件の購読・登録・選択の処理をまとめる
    - 共通の登録処理: `_choices/_hooks/`
    - `_choices/index.tsx` の `ExpeditionChoices` で各 hook を呼ぶ（`ExpeditionEventListeners` と同じ形）
  - 選択肢の追加で変わるファイル: `_choices/<機能>/` と `ExpeditionChoices` の 1 行のみ
  - event で結び付けないもの
    - 中継点の選択中（`pressed`）: 選択肢の属性として store に入れる
    - 揺れ: パネルの持ち物のため imperative handle のまま
