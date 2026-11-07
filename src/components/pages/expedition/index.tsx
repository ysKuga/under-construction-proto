'use client'

import { ExpeditionContents } from './_contents'
import { ExpeditionProviders } from './index.providers'
import { ExpeditionProps } from './index.types'

/**
 * Expedition — expedition ページ（hex グリッド版）
 *
 * - proto-02（矩形グリッド・隣接クリック逐次移動）を hex グリッドへ移し替えた
 *   試作。移動方式自体は `HexStage` の `useHexMove` に内蔵済み（issue #162）
 * - ここでは Provider 群（`ExpeditionProviders`、`index.providers.tsx`）と
 *   ページ内容（`ExpeditionContents`、`_contents/index.tsx`）を組み合わせるのみ
 *   （構造見直し、issue #137）。content 間で共有する state は `_stores/` の各 store に置く
 *   - `_contents/stage-section`: ステージ（`stage-section/_contents/stage`: `HexStage` + 各レイヤー、
 *     移動・経路・中継点の操作）と bot の状態表示（`stage-section/_contents/bot-status-panel`）
 *   - `_contents/bot-bubbles`: bot 頭上の吹き出し（中継点・実行・EN 切れ）
 * - デバッグ要素（`_components/debug-panel`: 表示設定の切替・EN・リセット等）は表示しない。story で並べる
 * - 直接移動できないセルのクリック時は `HexStage-cell-click` の購読（`useCellClickEventListener`）で BFS 経路探索（`hex-stage/_lib/hex-path`）
 *   を行い、`PathPreviewLayer` へ結果を表示する。到達不能なら `useNotifications` で
 *   通知する（issue #137 backlog）
 * - 中継点の設定（issue #137 backlog）: 経路が求まると選択肢パネル（実行・中継点・キャンセル）を開く（issue #393）。
 *   「中継点」で中継点選択モード（`'selecting'`）へ移行し、`HexStage` を `interactive={false}` にして
 *   `WaypointSelectLayer` がセルクリックを拾って中継点を設置/除去する（設置済みセルへ 📍 を表示）。
 *   設置した中継点は最近傍順に経由する経路として `PathPreviewLayer` へ反映する
 *   （`findHexPathViaWaypoints`、issue #226）。「実行」で経路に沿って自動移動する（`HexStageHandle.followPath`）。EN 不足で進入できなくなったら
 *   その場で停止し、トーストで警告する

 * - 霧の適用範囲（初期表示）はデバッグ要素の「初期表示」select でプレイ中に切替可能。初期値は
 *   `initialFogMode`（既定 `all-hidden`）。`partial` の霧セルはゴールとその6近傍
 * - 確認ダイアログは対象外（別途検討）
 * - 歩行モーション（`HexStage` の `enableWalking`）はデバッグ要素のチェックボックスで切替可能（既定 ON）。
 *   到着時の `walkingReset`（issue #162 の腕脚位置リセット action）により、
 *   1 マスごとの隣接クリック移動でも到着後に行進が続く不自然さが解消したため既定有効化。
 *   無効化との比較用にチェックボックスは残す

 * - EN（エネルギー、issue #181）: 1 マス移動するごとに 1 消費、アイテムの補給量ぶん
 *   補給する。予定経路・tick 駆動の「実行」は proto-01 と異なり導入しない（1 マス
 *   ごとの隣接クリック移動のまま）ため、`canEnterCell` へ残量判定を加え、移動成立時
 *   に `Energy-consume`/`Energy-charge` イベントを dispatch する（実消費・実補給・
 *   0 以下/より大きくなった判定・`Energy-depleted`/`Energy-recovered` 発行は energy
 *   store 側の consume/charge-listener が担う。proto-01 の `use-find-path-tick`
 *   と同じ経路）
 * - EN 切れ演出（予防姿勢、issue #181、proto-01 の `energyOutAction` 相当）:
 *   `HexStage` が `actorEventTarget` prop 経由で bot と共有する EventTarget を公開
 *   するようにし（stage-06 と同じ方式）、stage content で `useBoxBotActionDispatcher`
 *   から `energyOut` dispatcher を得る。`useRegisterEnergyOut`（`_stores/energy`、
 *   proto-01 と共通化）へ登録するだけでよく、トグル発火・復帰は
 *   `useOutOfEnergyEventListener`（scope 全体で 1 回だけ）が
 *   `Energy-depleted`/`Energy-recovered` 購読で一元的に担う
 * - マスの情報表示（issue #137、PR #313）: `GeoLayer` が発行する `HexStage-cell-hover`
 *   を `CellInfoPanel`（ステージ・bot の状態表示の下）が購読し、hover 中マスの内包要素を一覧表示する。
 *   `ObstacleLayer` 等は `pointerEvents: none` の非対話オーバーレイのため、hover は
 *   `GeoLayer` のセル本体が受ける
 * - EN 補給アイテム/EN スポット（issue #181、proto-01 から移植）: proto-01 と同じ
 *   `ItemStore` を axial 座標へ移植した固有実装（`_stores/items`）。stage content の
 *   `handleCellChange` で、EN 補給アイテムは携行（`_stores/carried-items`、issue #281）、
 *   EN スポットは即時補給する

 * - 経路の提示・実行（issue #226）: UI は `ExpeditionEventProvider`（`_events`）の
 *   EventTarget へ担当範囲の情報を発行し、EN 等のゲーム要素による実行可否は
 *   listener 側で判定する（docs/concept/implementation/ui-jurisdiction）
 */
const Expedition = (props: ExpeditionProps) => (
  <ExpeditionProviders {...props}>
    <ExpeditionContents />
  </ExpeditionProviders>
)

export default Expedition
