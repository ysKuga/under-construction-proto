# Storybook stories

コンポーネント実装時、`index.stories.tsx` を基本的に追加する。

## 対象外

- `_components/` 配下の子コンポーネント(特定の親からのみ使用され、単独で意味を持たない)
- Canvas/Context/Provider 等、特定の実行環境配下でしか動作せず単独マウントできないコンポーネント

## 構成

対象コンポーネントと同列に配置する。

```tsx
import { Meta, StoryObj } from '@storybook/react'

import ComponentName from '.'

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    /* ... */
  },
}
```

- default export のコンポーネント: `import ComponentName from '.'` のまま使う
- named export のコンポーネント: `import { ComponentName as StoryComponent } from '.'` とエイリアスして使う
