# _story-decorators

各バリエーションの `index.stories.tsx` 共通の Storybook decorator。

- `withBot`: `_components/bot-overlay`(`BotOverlay`)+ `BoxBot` でラップ。画面座標オーバーレイ型(circle/square/anchor 等)向け
- `withBotStacked`: bot 下部に縦積みでラップ。常時表示型(row/single 等)向け
- `withBotChildren`: `BoxBot` の `children` として配置。3D 投影配置型(ring/ground-ring 等)向け

`_components/` と同列に配置(`_components/bot-overlay` を参照するため、同列 import を避ける。`.claude/rules/sibling-import.md` 参照)。
