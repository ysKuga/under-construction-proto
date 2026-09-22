# 実装計画（issue #137）

- [ ] mob（プレイヤー以外の actor）を実際に画面へ配置できるようにする
  - `ActorsLayer`（stage-07 等）が単一 actor 限定設計（複数 actor 対応は対象外と明記、issue #162）。mob 表示にはここの複数 actor 化が必要（issue-181-en 2026-09-22 調査）
  - EN 個別化（`outOfEnergyRef` の actorId キー付き化、`energyOut` dispatcher のレジストリ化）は対応済み（decision-records.md 2026-09-22）。mob 側は `useRegisterEnergyOut(actorId, energyOut)` を呼ぶだけで個別の EN 切れ演出が動く
  - `EnergyDebugPanel`/`canEnterCell` の EN 判定は依然 `PLAYER_ACTOR_ID` 決め打ちのまま（実際に mob を追加する段階で見直す）
  - `useBoxBotActionDispatcher` の戻り値が `useMemo` 化されておらず毎レンダー新規オブジェクトになる（`energyOut` 参照が不安定 → `useRegisterEnergyOut` の effect が無駄に再実行される）。mob 数が増えると積み重なるが現状実害なし、見送り（decision-records.md 2026-09-22）
- [ ] 到達済みマス表示 ON 時 or 視界制限不採用時、非隣接クリックで自動経路探索移動（旧 stage-04 の BFS 実装移植候補。[stage-04-pathfinding/design.md](../_closed/20260716-stage-04-pathfinding/design.md)）
- [ ] ステージ上で動作する bot とは別に bot を独立表示し、「現在どちらを向いているか」を同期して表示する実装を検討
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
