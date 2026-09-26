# 決定事項（proto-03 の独立 bot へステージ上の bot の歩行を同期する）

- 2026-09-26: 共有 EventTarget の置き場は `_contexts/player-actor-event-target` の Provider とする
  - `Stage07HandleProvider` と同じく、複数 content（stage・standalone-bot）から参照する値を Context で配る方式に合わせる
  - `StageArea` で生成して props で渡す案は、`_contents` の各 content が props を持たず store/context から読む現構成と合わないため不採用
- 2026-09-26: 中継は `useEventListener` でなく `addEventListener` で直接購読する（`useRelayEvents`）
  - `useEventListener` は同一 target・type の多重登録を既定で禁止する
  - 中継の購読が先に登録されると、後から attach される bot 側の action listener が登録エラーになる
- 2026-09-26: 同期する action は `STANDALONE_BOT_ACTIONS`（独立 bot の `actions`）から導出し、中継対象と受付 action を一致させる
- 2026-09-26: 独立 bot の `interactive` は既定(true)にする
  - box-bot の action は `interactive=false` の間 dispatch を無視するため、false のままでは中継した walking が再生されない（目視確認で発覚）
  - クリック(既定の `clickBindings` = jump/spin)は `actions` に含めないため反応しない。ステージ上の bot と同じ構成
