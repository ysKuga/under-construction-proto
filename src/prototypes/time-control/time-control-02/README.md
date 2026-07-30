# TimeControl02

複数キャラクター (actor) の移動と、action-phase 情報付きの行動履歴を管理するプロトタイプ。

## 設計

- 本体ロジックは `_stores/actor-store.ts` (zustand vanilla store) のみで完結する。React コンポーネントは動作確認用のデモに留める。
- `list-rendering/list-02` と同様、store インスタンス (不変参照) を Context 経由で配布し、各コンポーネントは `useActorStore(selector)` で必要な部分だけ購読する。actor ごとの position 更新は、その actor の position を購読するコンポーネントのみを再レンダリングする。
- 座標は自由 (`{ x, y }`)、初期値 `{ x: 0, y: 0 }`、クランプなし。

## action-phase との対応

`docs/concept/ideas/action-phase.md` の 企図(Intent) → 予備 → 実行 → 成否 → 事後(Resolution) の5段階のうち、`ActionPhase` 型は5段階すべてを表現できる。実際に発火するのは 企図(intent) → 実行(execution、tick 毎) → 事後(resolution、最終 tick) の3段階。予備動作・成否判定は対象外 (PreAction/Outcome は将来課題)。

## 移動フロー (Intent → Execution)

1. **set target** ボタン (actor ごと、`dispatchMoveIntent`): 移動先を宣言するのみ。この時点では `positionById` は変化しない。`speed`(距離/ms) と `tickMs`(後述) から1tickあたりの移動距離を求め、`generateMovePath` (`_lib/generate-move-path.ts`) で移動先までの経路 (`MovePath`) を生成し `movePathById` に格納する。
2. **行動決定** ボタン (全 actor 一括、`ActionBar` コンポーネント): 各 actor の企図をまとめて実行する。actor ごとの `progressModeById` に応じて挙動が変わる。
   - `manual`: 1回の押下で経路の先頭1 tick 分だけ進む (`actionLog` に `execution` を記録、最終 tick のみ `resolution`)。
   - `auto`: 押下後、actor ごとの `tickMs` 間隔の内部タイマーで経路を最後まで自動消化する。
3. **mode** ボタン (全 actor 一括、`ActionBar` コンポーネント): `auto`/`manual` を切り替える。actor ごとの個別切り替えは廃止、常に全員同一モードで揃える。

## speed / tickRate

移動に関する値は役割ごとに2つに分離している。

- **speed** (`speedById`, 距離/ms): 実際の移動速度。1tickあたりの移動距離 (`stepDistance`) は `speed * tickMs` で決まる。
- **tickRate** (`tickRateById`): tick の発生頻度。`getTickMs` (`_lib/get-tick-ms.ts`) により `tickMs = BASE_TICK_MS / tickRate` を求める。\
  画面表示用の「敏捷性 (agility)」は将来別途追加予定のため、内部実装専用の値として `tickRate` という別名にしている (agility → tickRate の変換式は未定)。

各 actor の `path.length * tickMs` が目標地点までの推定所要時間 (eta) になり、`ActorItem` に表示する。

## スケジュールプレビュー

`行動決定` を押す前に、各 actor の tick タイミングを実時間でマージした表 (`SchedulePreview`) を表示する。`_lib/build-schedule.ts` の `buildSchedule` が、actor ごとの残り経路 (`movePathById`) と `tickRateById` から `tickMs` の倍数でタイムスタンプを算出し、同一時刻に複数 actor の tick が重なる場合は1行にまとめる。実行エンジン (`dispatchAction` の actor 個別 `setTimeout` ループ) 自体は変更していないため、あくまで「このまま `行動決定` を押したらどうなるか」の予定表であり、実際のログ (`ActionLogPanel`) とは別コンポーネント。

## スコープ外

- 経路探索 (障害物回避)・境界処理 (クランプ/ワープ) は対象外。移動経路は直線を tick 刻みで分割するのみ。
- PreAction (状態異常等の割り込み) / Outcome (成否判定) は将来課題。
