# components/theater/figure/

actor をレンダリングする要素 ([docs/terminology/theater/actor/figure/](../../../../docs/terminology/theater/actor/figure/README.md)) を格納する。

- `figure` の「人形」的な意味合い。actor オブジェクト内に ReactNode として持たせる。
- `components/samples/figure/box-bot` はデモ用の見本実装 (影を各パーツから精度高く算出) として別に残る。こちらはゲーム内で実際に使う本実装で、表示領域を設置領域に一致させる制約 (#108) を守る。
