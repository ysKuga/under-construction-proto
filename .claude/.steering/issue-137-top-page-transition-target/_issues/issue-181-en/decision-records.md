# 決定事項（エネルギー）

- 2026-09-16: 「歩数制限」から「エネルギー」へ改称。ローグライク的な燃料ゲージを想起しやすい命名（コード上の変数名も energy 系に合わせる）
- 2026-09-16: 消費・回復方式は「実行中消費型」。予定経路は自由に組め、「実行」tick 進行ごとに1消費、道中の回復要素で回復する。「事前判定型」（予定経路作成時点で上限超過を選択拒否）は、まだ実行していない時点で回復アイテムを「拾った」前提の計算が必要になり不自然なため不採用
- 2026-09-16: 回復手段は2種。道中に落ちている回復アイテム（踏むと回復）／固定セルの回復スポット（ガソリンスタンド的、到達で回復）
- 2026-09-16: 略称は「EN」。UI 表示等で使う。今後 PJ 全体として、概念には簡潔な略称を用意していく方針
- 2026-09-16: EN はステージでなく actor（box-bot）に属する値（ローグライク的にキャラクター側の資源とする）。注入は Context 経由とし、props 追加による変更波及を避ける。汎用的な注入手段の整備自体は本 issue のスコープ外、別途プロジェクト全体の課題として検討
- 2026-09-16: 回復スポットは固定量回復を複数回（在庫を持ち枯渇しうる、ガソリンスタンドの在庫的な挙動）
- 2026-09-16: 回復アイテムは固定量だが1個で複数手分回復する量（現実の「1食で数時間活動できる」相当の量感を想定）
- 2026-09-16: EN 残量の UI 表示は数値表示（`EN: 5/10`）
- 2026-09-16: 実装対象は proto-01・proto-03 両方。proto-01 は「実行」tick 駆動（`useFindPathTick`）が既存のためそのまま統合、proto-03 は tick 駆動自体が未実装（隣接クリック逐次移動のみ）のため新設が必要。両者を分離し、proto-03 側は別 PR とする
- 2026-09-16: EN store は find-path 固有の zustand store として新設（`FindPathStoresProvider` と同じ `createStoreContext` パターン）。time-control-03（汎用時間管理ロジック）へは持ち込まない、EN はゲームデザイン上の資源管理概念のため
- 2026-09-16: PR #183 で proto-01 の EN 保持・Context 注入・消費ロジック（`useFindPathTick` への統合、0 で打ち切り）を実装。回復ロジックは別 PR
- 2026-09-16: 略称「EN」は画面表示専用（3行目の方針を再徹底）。型・変数・store・関数等の実装識別子は正式名称 `energy` を使う（`EnStore` 等の略称実装を `EnergyStore` 等へ修正）。JSDoc コメントも「エネルギー」表記に統一する
- 2026-09-17: EN 残量 UI（`EN: x/y`）を proto-01 の `ActionBar` へ実装。専用コンポーネント新設でなく既存 `ActionBar` へ `useEnergyStore` selector で表示（`usePlannedPathStore`/`useGameClockStore` と同じ配置パターン）。Storybook + Playwright で「実行」による消費 → 表示反映（10/10 → 9/10）を確認
- 2026-09-17: proto-03（hex）への tick 駆動「実行」導入は規模が大きいため PR-A（stage-07 基盤: `interactive` prop + hex 版 ActorNodeRegistry）→ PR-B（EnergyStore を proto-01 から find-path 共有層へ移設）→ PR-C（hex tick駆動+EN配線+UI）の3段階に分割する
- 2026-09-17: PR-A 実装。stage-06 の `ActorNodeRegistryProvider`（DOM 直書き）とは異なり、stage-07 版は `useState` ベースの Context に留める（stage-07/proto-02/03 は元々 props 経由で再レンダリングする設計のため、DOM 直書きへの書き換えは不要な複雑化と判断）。`Stage07Props.initialCell` は廃止し `ActorNodeRegistryProvider` 側の prop へ移設。`Stage07Props.interactive`（既定 `true`）を新設し、hex 版 `GeoLayer` を stage-06 と同じ button/div 分岐にした
- 2026-09-17: PR-B 実装。EnergyStore（constants/context/index/store/types）を `find-path/_prototypes/proto-01/_stores/energy` から `find-path/_prototypes/_stores/energy`（proto-01/02/03 共有、`_prototypes` 配下に留める）へ移設。find-path ページ自体（route/page）は未実装のため `_prototypes` の外（`find-path/_stores`）へは出さない。proto-01 側の import は絶対パス（`@/components/pages/find-path/_prototypes/_stores/energy`）へ変更。PR-C で proto-03 が同 store を参照できるようにするための下準備、挙動変更なし
- 2026-09-17: PR-C（proto-03 tick駆動+EN配線）は複数マス選択（予定経路）機能を含めて実装したが、選択済みセルのフェードアウト表示が tick 消化に追従せず revert（PR #188、docs/concept/implementation/multi-cell-selection/README.md）。再実装時は複数マス選択をスコープ外とし、既存の隣接クリック逐次移動方式のまま tick 駆動「実行」+ EN 消費配線のみ対応する。フェードアウト表示機構（DOM 直書き移植 or store 設計作り直し）の検討は複数マス選択を再着手する際まで持ち越し
- 2026-09-17: proto-03 の EN 配線を実装。tick 駆動「実行」自体は導入せず、既存の隣接クリック逐次移動（`useHexMove`）へ直接組み込んだ。`EnergyStoreContext.Provider` を `ActorNodeRegistryProvider` の外側に配置し、`canEnterCell` へ EN 残量 >0 判定を追加、移動成立時（`onCellChange`）に EN 1 消費する。Storybook + Playwright で10手移動後の EN 切れ・進入不可を確認
