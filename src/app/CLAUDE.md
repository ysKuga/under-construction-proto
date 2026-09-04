# src/app/CLAUDE.md

## 実装の配置

`src/app/` 配下、ルーティング配線のみとする。実装(JSX/hooks/stories)は `src/components/pages/` へ置く。

- `page.tsx`: 対応する `components/pages/<route>/` から import して re-export するだけにする。
- `layout.tsx`: `components/layouts/_base`(`<html>`/`<body>`)で `components/pages/layout`(`AppProvider` + `<main>`)をラップする。`metadata` は `components/pages/layout` から re-export する。

```tsx
import Home from '@/components/pages/home'

export default Home
```

パスと実装の対応一覧は [components/pages/README.md](../components/pages/README.md) 参照。
