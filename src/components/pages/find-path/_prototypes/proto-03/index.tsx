'use client'

import { FindPathProto03Contents } from './_contents'
import { FindPathProto03Providers } from './index.providers'
import { FindPathProto03Props } from './index.types'

/**
 * FindPathProto03 —find-path ページ試作（hex グリッド版）
 *
 * - proto-02（矩形グリッド・隣接クリック逐次移動）を hex グリッドへ移し替えた
 *   試作。移動方式自体は `Stage07` の `useHexMove` に内蔵済み（issue #162）
 * - ここでは Provider 群（`FindPathProto03Providers`、`index.providers.tsx`）と
 *   ページ内容（`FindPathProto03Contents`、`_contents/index.tsx`）を組み合わせるのみ
 *   （構造見直し、issue #137）。content 間で共有する state は `_stores/` の各 store に置く
 *   - `_contents/title`: 見出し
 *   - `_contents/stage-area`: ステージ（`_contents/stage`: `Stage07` + 各レイヤー、
 *     移動・経路・中継点の操作）と独立 bot（`_contents/standalone-bot`）
 *   - `_contents/bot-bubbles`: bot 頭上の吹き出し（中継点・実行）
 *   - `_contents/control-panel`: 表示設定の切替・EN・リセット等
 * - 非隣接セルクリック時は `onNonAdjacentClick` 経由で BFS 経路探索（`stage-07/_lib/hex-path`）
 *   を行い、`PathPreviewLayer` へ結果を表示する。到達不能なら `useNotifications` で
 *   通知する（issue #137 backlog）
 * - 中継点の設定（issue #137 backlog）: 経路が求まると bot 頭上に `WaypointBubble`
 *   （思考吹き出し）を表示し（`waypointFlowState !== 'idle'`、クリックで移行する
 *   選択モード中も表示を継続）、クリックで中継点選択モード（`'selecting'`）へ
 *   移行する。`WaypointBubble` は自身では
 *   座標計算を持たないため、`useActorsStore` の `overlayContainers` が公開する、
 *   player bot 用のコンテナ DOM（`playerOverlayContainer`、floor の 3D 空間外で
 *   bot の画面上の位置へ追従する）へ `createPortal` で注入する。位置は
 *   `WAYPOINT_BUBBLE_POSITION_CLASS_NAME`（bot 頭上の決め打ちオフセット）を渡す。`WaypointBubble` は現状、表示位置確認のための
 *   暫定実装（border 付き button）。`selectable` prop（枠線の実線/点線切替）は
 *   store で中継点選択モードを管理する想定の先行実装で、ここでは固定値 `false`
 *   を渡す（store 接続は次段階）。コンテナが floor の 3D 空間外にあるため、
 *   `GeoLayer` セルと重なってもクリックを奪われない。選択モード中は
 *   `Stage07` を `interactive={false}` にし、
 *   `WaypointSelectLayer` がセルクリックを拾って中継点を設置/除去する
 *   （設置済みセルへ 📍 を表示）。通常モードのクリック（`useHexMove` 経由）とは
 *   完全に別イベントとして分離する設計方針。`WaypointSelectingIndicator`
 *   （選択中インジケータ + 「完了」ボタン）で選択モードを終了し通常状態へ戻る。
 *   `WaypointBubble`/`WaypointSelectLayer`/`WaypointSelectingIndicator` は
 *   いずれも表示制御（`useCssToggle`）込みで自己完結したコンポーネントへ切り出し
 *   済み、親からは `visible` prop のみで駆動する（各 content が
 *   `waypointFlowState`（`_stores/waypoint-flow`）を購読して渡す）。
 *   設置した中継点は最近傍順に経由する経路として `PathPreviewLayer` へ反映する
 *   （`findHexPathViaWaypoints`、issue #226）。bot を挟んで反対側の
 *   `ExecuteBubble`（「実行」吹き出し）で経路に沿って自動移動する（`Stage07Handle.followPath`）。EN 不足で進入できなくなったら
 *   その場で停止し、トーストで警告する

 * - 霧の適用範囲（初期表示）は「初期表示」select でプレイ中に切替可能。初期値は
 *   `initialFogMode`（既定 `all-hidden`）。`partial` の霧セルは `PARTIAL_FOG_CELLS`
 * - 確認ダイアログは対象外（別途検討）
 * - 歩行モーション（`Stage07` の `enableWalking`）はチェックボックスで切替可能（既定 ON）。
 *   到着時の `walkingReset`（issue #162 の腕脚位置リセット action）により、
 *   1 マスごとの隣接クリック移動でも到着後に行進が続く不自然さが解消したため既定有効化。
 *   無効化との比較用にチェックボックスは残す

 * - EN（エネルギー、issue #181）: 1 マス移動するごとに 1 消費、アイテム回復量ぶん
 *   回復する。予定経路・tick 駆動の「実行」は proto-01 と異なり導入しない（1 マス
 *   ごとの隣接クリック移動のまま）ため、`canEnterCell` へ残量判定を加え、移動成立時
 *   に `Energy-consume`/`Energy-recover` イベントを dispatch する（実消費・実回復・
 *   0 以下/より大きくなった判定・`Energy-depleted`/`Energy-recovered` 発行は energy
 *   store 側の consume/recover-listener が担う。proto-01 の `use-find-path-tick`
 *   と同じ経路）
 * - EN 切れ演出（予防姿勢、issue #181、proto-01 の `energyOutAction` 相当）:
 *   `Stage07` が `actorEventTarget` prop 経由で bot と共有する EventTarget を公開
 *   するようにし（stage-06 と同じ方式）、stage content で `useBoxBotActionDispatcher`
 *   から `energyOut` dispatcher を得る。`useRegisterEnergyOut`（`_stores/energy`、
 *   proto-01 と共通化）へ登録するだけでよく、トグル発火・復帰は
 *   `useOutOfEnergyEventListener`（scope 全体で 1 回だけ）が
 *   `Energy-depleted`/`Energy-recovered` 購読で一元的に担う
 * - 障害物の説明表示（issue #137）: `ObstacleLayer` は `pointerEvents: none` の
 *   非対話オーバーレイで hover を受け取れないため、実際にマウスオーバーを受ける
 *   `GeoLayer` のセル本体へ `title` を持たせる。stage-07 は find-path 固有の概念を
 *   持たないため、`CellTitleProvider`（`stage-07/_contexts/cell-title`）で
 *   `getCellTitle` の中身（障害物・アイテムの説明、`getCellContents`/
 *   `describeCellContent`）を注入する（PR #196 レビュー対応）
 * - 回復アイテム/回復スポット（issue #181、proto-01 から移植）: proto-01 と同じ
 *   `ItemStore` を axial 座標へ移植した固有実装（`_stores/items`）。proto-03 は
 *   予定経路・tick 駆動を持たないため即時使用のまま（携行可能化は対象外、別途検討）。
 *   stage content の `handleCellChange` で移動先セルのアイテムを消費し即時回復する

 * - 経路の提示・実行（issue #226）: UI は `FindPathEventProvider`（`_events`）の
 *   EventTarget へ担当範囲の情報を発行し、EN 等のゲーム要素による実行可否は
 *   listener 側で判定する（docs/concept/implementation/ui-jurisdiction）
 */
const FindPathProto03 = (props: FindPathProto03Props) => (
  <FindPathProto03Providers {...props}>
    <FindPathProto03Contents />
  </FindPathProto03Providers>
)

export default FindPathProto03
