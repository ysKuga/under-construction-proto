# _story-decorators

各バリエーションの `index.stories.tsx` 共通の Storybook decorator。

- `withBot`: `_components/bot-overlay`(`BotOverlay`)+ `BoxBot` でラップ。bot 付きで確認したいバリエーション(circle/square/anchor 等)向け
- `withoutBot`: Story をそのままレンダー。bot 不要なバリエーション(row/single 等)向け

`_components/` と同列に配置(`_components/bot-overlay` を参照するため、同列 import を避ける。`../../sibling-import.md` 参照)。
