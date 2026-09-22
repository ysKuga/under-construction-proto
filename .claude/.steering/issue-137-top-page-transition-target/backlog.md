# 実装計画（issue #137）

- [ ] proto-03（`FindPathProto03Content`）の `EnergyDebugPanel` 操作で `Stage07` 込みのツリー全体が再レンダリングされる
  - `MoveTargetLayer`（移動可能マス表示）が `canEnterCellPerceived` 経由で EN 残量を参照しており、表示更新を親の再レンダリングに頼っている
  - 直すには `Stage07` 配下レイヤー群の `React.memo` 化 + `MoveTargetLayer` 自身の EN store 直接購読への切替が必要（規模が大きいため見送り、issue-181-en 2026-09-21）
- [ ] mob（プレイヤー以外の actor）が EN を個別に持てるようにするリファクタ
  - 現状（issue-181-en 2026-09-21）は `PLAYER_ACTOR_ID` 固定のシングルアクター前提
    - `EnergyStore.energyById`（`Record<ActorId, EnergyInfo>`）自体はマルチアクター対応
    - `EnergyDebugPanel`/`canEnterCell` の EN 判定は `PLAYER_ACTOR_ID` 決め打ち
    - `outOfEnergyRef`（EN 切れ演出のトグル状態）はコンポーネント内の単一 `useRef`、mob 数ぶん持てない
    - `useBoxBotActionDispatcher(actorEventTarget, ...)` が 1 bot = 1 `EventTarget` の設計、mob ごとに別 dispatcher が要る
    - `EnergyEventProvider` は scope 全体で 1 つの `EventTarget` を共有するため、`Energy-depleted`/`Energy-recovered` 購読側で「自分（担当 actorId）宛てか」の比較が必要になっている
  - 改善方針: `outOfEnergyRef` を `actorId` キー付きの store（`Record<ActorId, boolean>` 等）へ集約すれば、購読側は該当 actorId のエントリを直接更新/参照するだけで済み、actorId 比較の条件分岐が不要になる（ユーザー確認済み方針）
    - ただし `energyOut` dispatcher 側も actorId ごとのレジストリ化が要る（box-bot 1体 = 1 dispatcher の現設計とセットで見直す必要あり）
- [ ] 到達済みマス表示 ON 時 or 視界制限不採用時、非隣接クリックで自動経路探索移動（旧 stage-04 の BFS 実装移植候補。[stage-04-pathfinding/design.md](../_closed/20260716-stage-04-pathfinding/design.md)）
- [ ] ステージ上で動作する bot とは別に bot を独立表示し、「現在どちらを向いているか」を同期して表示する実装を検討
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
