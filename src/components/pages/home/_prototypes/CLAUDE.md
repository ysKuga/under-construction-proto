# _prototypes/

トップページ改修の試作置き場。

## 構成

- `proto-01`/`proto-02`: 試作(実装積み上げ順、`proto-02` は削除予定・変更しない)
- `ui/`: 操作 UI 要素の配置バリエーション検討(画面座標ベース)。詳細は `ui/CLAUDE.md` 参照
- `ui-three/`: 3D 空間内(three.js/r3f)装飾要素の配置バリエーション検討。詳細は `ui-three/CLAUDE.md` 参照
- `_components/`: `ui/`・`ui-three/` 共通の実装置き場
  - `bot-overlay`: bot 表示領域と同サイズのオーバーレイコンテナ(circle/square/anchor 共通の土台)
- `_story-decorators`: 各バリエーションの `index.stories.tsx` 共通の Storybook decorator(`withBot`/`withBotStacked`/`withBotChildren`)。`_components/bot-overlay` を参照するため `_components/` と同列に配置(同列 import を避ける)
