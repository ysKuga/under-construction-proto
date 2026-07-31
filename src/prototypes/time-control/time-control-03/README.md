# TimeControl03

複数キャラクター (actor) の移動と、action-phase 情報付きの行動履歴を管理するプロトタイプ。time-control-02 の store 責務分割版。

## time-control-02 からの変更点

02 では `actionLog` の `gameTimeMs` が actor 毎独立の `tickCountById * tickMs` で算出されており、複数 actor が断続的に行動決定すると履歴の行順序が実際の決定順と食い違う問題があった (詳細は `.claude/.steering/20260727-time-control-02-next-steps/design.md`)。

03 ではこれを解消するため、単一の store (`actor-store.ts`) に同居していた責務を 6 store に分割し、`gameTimeMs` を全 actor 共通の単一クロック (`commonGameTimeMs`) から払い出す方式に変更した。

## store 構成

- **`game-clock-store`**: 共通ゲームクロック (`commonGameTimeMs`) とあらゆるイベントの時系列ログ (`eventLog`)。`logEvent(payload, advanceTickMs?)` は `advanceTickMs` を省略すると現在のクロック値をそのまま使い (企図向け)、指定するとその分クロックを進めてから新しい値を使う (tick 消費向け)。実行順で単調増加・非重複を保証する
- **`actor-store`**: actor の実装 (移動速度・tick 発生頻度) に直接関係する情報のみ。`actorById: Record<ActorId, ActorInfo>` (フィールドごとに `xxxById` を分けず、actor 単位でオブジェクトにまとめている)
- **`actor-settings-store`**: 経路の最低 step 数・行動進行モードなど、ユーザー操作で変わる設定
- **`path-store`**: actor ごとの残り移動経路 (`pathById`) のみ
- **`position-store`**: actor ごとの現在位置 (`positionById`) + `dispatchAction` (行動決定)。actor-store/actor-settings-store/path-store/game-clock-store に依存する
- **`intent-store`**: 状態を持たない操作専用 store。`dispatchMoveIntent` (企図) のみ。actor-store/actor-settings-store/path-store/position-store/game-clock-store に依存する

依存関係は生成時の注入 (直接呼び出し) で済ませている。将来 Custom Event 経由の疎結合化 (`design.md` 実装計画3) に移行する際の置換点になる想定。

02 から変更不要なファイル (`_lib/generate-move-path.ts`/`get-tick-ms.ts`/`stage-coords.ts`/`build-history.ts`/`format-coord.ts`、`types.ts`) はコピーせず import している (`src/prototypes/CLAUDE.md` の依存ルール)。

## action-phase との対応

`docs/concept/ideas/action-phase.md` の 企図(Intent) → 予備 → 実行 → 成否 → 事後(Resolution) の5段階のうち、`ActionPhase` 型は5段階すべてを表現できる。実際に発火するのは 企図(intent) → 実行(execution、tick 毎) → 事後(resolution、最終 tick) の3段階。予備動作・成否判定は対象外 (PreAction/Outcome は将来課題)。

## 移動フロー (Intent → Execution)

1. **set target** ボタン (actor ごと、`intent-store` の `dispatchMoveIntent`): 移動先を宣言するのみ。この時点では `positionById` は変化しない。`speed`(距離/ms) と `tickMs`(後述) から1tickあたりの移動距離を求め、`generateMovePath` (02 の `_lib/generate-move-path.ts`) で移動先までの経路 (`MovePath`) を生成し `path-store` に格納する。
2. **行動決定** ボタン (全 actor 一括、`ActionBar` コンポーネント): 各 actor の企図をまとめて実行する。`actor-settings-store` の `progressMode` に応じて挙動が変わる。
   - `manual`: 1回の押下で経路の先頭1 tick 分だけ進む (`game-clock-store` に `execution` を記録、最終 tick のみ `resolution`)。
   - `auto`: 押下後、actor ごとの `tickMs` 間隔の内部タイマーで経路を最後まで自動消化する。
3. **mode** ボタン (全 actor 一括、`ActionBar` コンポーネント): `auto`/`manual` を切り替える。actor ごとの個別切り替えは廃止、常に全員同一モードで揃える。

## speed / tickRate

移動に関する値は役割ごとに2つに分離している (`actor-store` の `ActorInfo`)。

- **speed** (距離/ms): 実際の移動速度。1tickあたりの移動距離 (`stepDistance`) は `speed * tickMs` で決まる。
- **tickRate**: tick の発生頻度。`getTickMs` (02 の `_lib/get-tick-ms.ts`) により `tickMs = BASE_TICK_MS / tickRate` を求める。\
  画面表示用の「敏捷性 (agility)」は将来別途追加予定のため、内部実装専用の値として `tickRate` という別名にしている (agility → tickRate の変換式は未定)。

各 actor の `path.length * tickMs` が目標地点までの推定所要時間 (eta) になり、`ActorItem` に表示する。

## スケジュールプレビュー

`行動決定` を押す前に、各 actor の tick タイミングを共通ゲームクロック起点でマージした表 (`SchedulePreview`) を表示する。`_lib/build-schedule.ts` の `buildSchedule` が、actor ごとの残り経路 (`pathById`) と `tickRate`、`commonGameTimeMs` から `tickMs` の倍数でタイムスタンプを算出し、同一時刻に複数 actor の tick が重なる場合は1行にまとめる。実行エンジン (`dispatchAction` の actor 個別 `setTimeout` ループ) 自体は変更していないため、あくまで「このまま `行動決定` を押したらどうなるか」の予定表であり、実際のログ (`ActionLogPanel`) とは別コンポーネント。

## スコープ外

- 経路探索 (障害物回避)・境界処理 (クランプ/ワープ) は対象外。移動経路は直線を tick 刻みで分割するのみ。
- PreAction (状態異常等の割り込み) / Outcome (成否判定) は将来課題。
- 複数 actor 間の実際の実行順序 (auto 進行の実時間ずれ) を正確にシミュレートしたスケジュールプレビューは対象外 (近似値)。
