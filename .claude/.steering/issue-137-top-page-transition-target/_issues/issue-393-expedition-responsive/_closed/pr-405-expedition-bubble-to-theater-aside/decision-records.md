# 決定事項（吹き出しの汎用部品の theater/aside への移動）

- 2026-10-23: 移し先を `src/components/theater/aside/` とする
  - `theater/bubble/` は不採用。区分名は aside（傍白）
  - 定義は `docs/terminology/theater/actor/aside/`（移動のコミットと合わせてコミットする）
- 2026-10-23（実装）: `bot-bubble`・`bubble-slots` を `theater/aside/` へ移した
  - `bubble-slots` の story: expedition の吹き出しでなく `BotBubble` を直接使う（theater から pages を import しないため）
  - `bot-bubble` の story を追加した（`_components/` 配下を外れ、story 不要の例外に当たらなくなったため）
