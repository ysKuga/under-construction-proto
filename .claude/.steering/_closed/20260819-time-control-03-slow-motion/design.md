# time-control-03-slow-motion

## 目的

`time-control-03` の auto 進行 (`_stores/position/store.ts` の `continueAuto`) に `timeScale` を導入し、スローモーション/倍速を実現する。

## 背景・制約

- 現状の auto 進行は `continueAuto` の setTimeout 自己再帰。`tickCount`/timer handle はクロージャローカルで外部から操作できない (関連: 前段でのポーズ実装検討時に判明)。
- `gameTimeMs` (`tickCount * tickMs`) はゲーム内時間の絶対値であり、`timeScale` の影響を受けない。変わるのは実時間との対応、つまり `setTimeout` の待ち時間のみ (`tickMs / timeScale`)。
- ポーズは `timeScale = 0` として統合できる可能性がある (0除算回避のため poll 方式などの分岐が別途必要)。統合するか `isPaused` を別軸で持つかは未決定。
- 参照ファイル:
  - `src/prototypes/time-control/time-control-03/_stores/position/store.ts` (`applyNextStep`/`startAutoIfNeeded`/`continueAuto`)
  - `src/prototypes/time-control/time-control-03/_stores/game-clock/store.ts` (`commonGameTimeMs`/`logEvent`/`logEventAt`)
  - `src/prototypes/time-control/time-control-03/_stores/actor-settings/store.ts` (`progressMode` toggle の実装パターン)
  - `src/prototypes/time-control/time-control-03/_events/_event-listeners/use-toggle-progress-mode-event-listener/index.ts` (イベント経由で store 操作するパターン)
- actor ごとに `tickRate` (tick 発生頻度) が個別設定されている。`timeScale` は全 actor 共通の倍率として一律適用する想定。

## 実装計画

- [x] `timeScale` の置き場所決定 (`game-clock` store に追加 vs 新規 store)
- [x] ポーズとの統合要否決定 (`timeScale = 0` で統合するか、`isPaused` を別軸で持つか)
- [x] `game-clock` store に `timeScale` state + `setTimeScale` action 追加
- [x] `position` store の `continueAuto` を fixed-step accumulator 方式に変更 (`REALTIME_STEP_MS` 固定間隔 + `accumulatedMs` 積算、`accumulatedMs >= tickMs` でtick消化)
- [x] 倍速時の複数tick同時消化対応 (`while (accumulatedMs >= tickMs)`)
- [x] `TimeControl03-set-time-scale` イベント新設 (dispatcher/listener、`toggle-progress-mode` と同パターン)
- [x] UI操作追加 (action-bar 内、`progress-mode-button` 同列に速度切替ボタン列 `TimeScaleControl`。候補値 `[0, 0.5, 1, 2, 4]`、0 は "pause" 表示)
- [x] テスト追加 (`game-clock-store.test.ts`/`position-store.test.ts` に追加、既存パターン踏襲)

## 決定事項

- tick消化判定の実時間刻み方式を採用: 待ち時間ずれ緩和のため、`tickMs` を実時間側で `REALTIME_STEP_MS` (仮10ms) 単位に分割しポーリングする fixed-step accumulator 方式を採る
- 上記の実時間刻み定数の名前は `REALTIME_STEP_MS` に決定
- ポーズを今回のスコープに統合する。`timeScale = 0` をポーズ相当として扱い、UI からも明示的に選択可能にする (accumulator が増えないため自然に停止する構造をそのまま利用)
- 実装完了。ユニットテスト (`game-clock-store.test.ts`/`position-store.test.ts`) 全通過、Storybook 実機確認でも pause 中の完全停止・4x 再開後の正常な倍速進行を確認済み

## 懸念・リスク

- `timeScale` 変更時、実行中の `setTimeout` は古い待ち時間のまま次回発火まで反映されない (即時性なし、次 tick 境界からの反映になる)
  - 緩和策: fixed-step accumulator 方式。`setTimeout` 間隔を固定の短い実時間刻み `REALTIME_STEP_MS` (仮 10ms) に統一し、発火毎に `accumulatedMs += REALTIME_STEP_MS * timeScale` を積算。`accumulatedMs >= tickMs` に達したら1tick消化 (`accumulatedMs -= tickMs`)。`timeScale` を毎回参照するため、変更が最大 `REALTIME_STEP_MS` の遅延で反映される (tick境界単位の遅延より大幅改善)
  - `timeScale = 0` (ポーズ相当) 時は `accumulatedMs` が増えないため自然に停止 → ポーズ統合案と整合する
  - 倍速時、1刻みで複数tick分溜まるケースがあり得るため `while (accumulatedMs >= tickMs)` で複数tick同時消化が必要になる
  - `setTimeout` 自体のブレ (ブラウザのスロットル等) で実測経過時間が刻み値からずれる。精度を求めるなら `Date.now()` 差分を使う可変dt方式が本筋 (固定刻みは近似)。まずは固定刻みで様子見が妥当
- 全 actor 共通倍率として適用する場合、actor 個別の `tickRate` との掛け合わせで意図しない速度にならないか要確認
- ポーズとの統合可否はユースケース次第 (スロー中にも一時停止したい要件があれば別軸で持つ必要が生じる)
