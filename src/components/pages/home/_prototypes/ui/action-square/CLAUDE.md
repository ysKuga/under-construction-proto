# action-square

bot 囲む四角形、四辺中央へボタン配置。画面座標(screen space)ベース、3D 投影計算なし。

`ACTION_LABELS` 先頭 4 件のみ使用(5件目「足踏み」、四角対応先なく未使用)。呼び出し側(例: `proto-02/index.tsx`)、bot 表示領域と同サイズ・同位置の `position: relative` コンテナ用意必須。
