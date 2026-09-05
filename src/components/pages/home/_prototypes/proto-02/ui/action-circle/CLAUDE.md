# action-circle

bot 囲む真円、外周へ等間隔配置。画面座標(screen space)ベース、3D 投影計算なし。

呼び出し側(`../../index.tsx`)、bot 表示領域と同サイズ・同位置の `position: relative` コンテナ用意必須。サイズ不一致時、円がずれる。
