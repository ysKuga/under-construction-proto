'use client'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07EventProvider } from '@/prototypes/stage/stage-07/_events'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import { FindPathProto03Contents } from './_contents'
import { ResetProvider } from './_contexts/reset'
import { Stage07HandleProvider } from './_contexts/stage07-handle'
import { VisibilityRegistryProvider } from './_contexts/visibility-registry'
import { FindPathEventProvider } from './_events'
import { DisplaySettingsStoreProvider } from './_stores/display-settings'
import { FogStoreProvider } from './_stores/fog'
import { FogMode } from './_stores/fog/types'
import { FollowPathStoreProvider } from './_stores/follow-path'
import { GoalStoreProvider } from './_stores/goal'
import { ItemStoreProvider } from './_stores/items'
import { ItemInstance } from './_stores/items/types'
import { WaypointFlowStoreProvider } from './_stores/waypoint-flow'
import {
  RECOVERY_ITEM_CELLS,
  RECOVERY_SPOT_CELLS,
  START_POSITION,
} from './constants'

/**
 * 初期配置するアイテム一覧（`RECOVERY_ITEM_CELLS`/`RECOVERY_SPOT_CELLS` から組み立てる）
 *
 * - 回復アイテムは `stock` 未指定（1個ずつ使い切り）、回復スポットは `stock` 指定
 *   （指定回数で枯渇しうる）で区別する（proto-01 と同型）
 */
const INITIAL_ITEMS: ItemInstance[] = [
  ...RECOVERY_ITEM_CELLS.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { q: cell.q, r: cell.r },
    id: `recovery-item-${index}`,
    kind: 'energy-recovery',
  })),
  ...RECOVERY_SPOT_CELLS.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { q: cell.q, r: cell.r },
    id: `recovery-spot-${index}`,
    kind: 'energy-recovery',
    stock: cell.stock,
  })),
]

type FindPathProto03Props = {
  /** 霧の適用範囲（初期表示）の初期値（既定 `all-hidden`） */
  initialFogMode?: FogMode
}

/**
 * FindPathProto03 —find-path ページ試作（hex グリッド版）
 *
 * - proto-02（矩形グリッド・隣接クリック逐次移動）を hex グリッドへ移し替えた
 *   試作。移動方式自体は `Stage07` の `useHexMove` に内蔵済み（issue #162）
 * - ここでは Provider 群の配置のみを担い、ページ内容は `FindPathProto03Contents`
 *   （`_contents/index.tsx`）に任せる（構造見直し、issue #137）。content 間で共有する
 *   state は `_stores/` の各 store に置く
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
 * - `VisibilityRegistryProvider` は未到達マスを非表示にするための Provider（proto-02
 *   の hex 版）。霧の状態・可視判定は `FogStoreProvider`（`_stores/fog`）が持ち、
 *   registry は DOM の登録・反映のみを担う。可視判定は霧セルについて「視界（現在地
 *   基準の6近傍）」または「到達済み表示ONかつ到達済みセル」（`setShowVisited` で
 *   切替可能、既定 ON）。`Stage07`（hex タイルの表示/非表示）・`GoalMarkerLayer`
 *   （旗の表示/非表示）から読めるよう `Stage07` の外側に置く
 * - 霧の適用範囲（初期表示）は「初期表示」select でプレイ中に切替可能。初期値は
 *   `initialFogMode`（既定 `all-hidden`）。`partial` の霧セルは `PARTIAL_FOG_CELLS`
 * - 確認ダイアログは対象外（別途検討）
 * - 歩行モーション（`Stage07` の `enableWalking`）はチェックボックスで切替可能（既定 ON）。
 *   到着時の `walkingReset`（issue #162 の腕脚位置リセット action）により、
 *   1 マスごとの隣接クリック移動でも到着後に行進が続く不自然さが解消したため既定有効化。
 *   無効化との比較用にチェックボックスは残す
 * - `ActorsStoreProvider`（hex 版、zustand store）は actorId ごとの現在セルを
 *   保持する Provider。`Stage07` の外側に置く（issue #181 PR-A。tick 駆動実行の
 *   追加に備え、外部からクリックを介さず actor を動かせるようにするため）。
 *   player・mob を区別せず一元管理する（issue #215）
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
 * - リセット（境界値テスト用、issue #181）: `ResetProvider`（`_contexts/reset`）が
 *   `EnergyStoreProvider` 以下（position 含む）へ `key` を付け、`reset` で Provider 群
 *   ごと丸ごと再マウントする（proto-01 と同じ方式）
 * - 経路の提示・実行（issue #226）: UI は `FindPathEventProvider`（`_events`）の
 *   EventTarget へ担当範囲の情報を発行し、EN 等のゲーム要素による実行可否は
 *   listener 側で判定する（docs/concept/implementation/ui-jurisdiction）
 */
const FindPathProto03 = (props: FindPathProto03Props) => {
  const { initialFogMode = 'all-hidden' } = props

  return (
    <ResetProvider>
      <EnergyStoreProvider>
        <FindPathEventProvider>
          <ItemStoreProvider initialItems={INITIAL_ITEMS}>
            <ActorsStoreProvider
              initialActors={{ [PLAYER_ACTOR_ID]: START_POSITION }}
            >
              <Stage07EventProvider>
                <FogStoreProvider initialMode={initialFogMode}>
                  <VisibilityRegistryProvider>
                    <FollowPathStoreProvider>
                      <WaypointFlowStoreProvider>
                        <DisplaySettingsStoreProvider>
                          <GoalStoreProvider>
                            <Stage07HandleProvider>
                              <FindPathProto03Contents />
                            </Stage07HandleProvider>
                          </GoalStoreProvider>
                        </DisplaySettingsStoreProvider>
                      </WaypointFlowStoreProvider>
                    </FollowPathStoreProvider>
                  </VisibilityRegistryProvider>
                </FogStoreProvider>
              </Stage07EventProvider>
            </ActorsStoreProvider>
          </ItemStoreProvider>
        </FindPathEventProvider>
      </EnergyStoreProvider>
    </ResetProvider>
  )
}

export default FindPathProto03
