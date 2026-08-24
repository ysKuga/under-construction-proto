# src/app/CLAUDE.md

## 実装の配置

`src/app/` 配下、ルーティング配線のみとする。実装(JSX/hooks/stories)は `src/components/pages/` へ置き、page.tsx 等はそこから import して re-export するだけにする。

```tsx
import Home from '@/components/pages/home'

export default Home
```

パスと実装の対応一覧は [components/pages/README.md](../components/pages/README.md) 参照。
