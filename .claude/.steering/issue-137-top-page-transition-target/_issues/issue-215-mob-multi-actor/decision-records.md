# 決定事項（issue #215）

- 2026-09-22: issue #137 backlog「mob配置」から GitHub 正式サブ issue #215 として分離
- 2026-09-22: コード調査の結果、mob 配置は `ActorsLayer` 単体でなく `useActorNodeRegistry`(単一 `currentCell`/`moveActor`)・`useHexMove`・`Stage07` まで player 前提で一直線に繋がっており、当初想定より規模が大きいと判明。ユーザーへ mob の挙動要件を確認し「静止表示のみ(自己移動・EN 等の動的挙動なし)」に決定。registry の複数 actor 化・`PLAYER_ACTOR_ID` 決め打ち解消(`EnergyDebugPanel`/`canEnterCell`)は対象外、mob が自律移動する段階で別途 issue 化する
- 2026-09-22: 上記方針で実装。`ActorsLayer` に `mobs?: {id, cell}[]` prop を追加、player 表示とは別に `actions={[]}` `interactive={false}` の静的 `BoxBot01` を map 描画。`Stage07` は `mobs` をそのまま `ActorsLayer` へ橋渡し。`index.stories.tsx` に `WithMob` story を追加、Playwright ヘッドレスで表示確認(コンソールエラーなし)。issue #215 close
