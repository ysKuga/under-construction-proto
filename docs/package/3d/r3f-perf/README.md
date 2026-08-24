# r3f-perf

<https://github.com/utsuboco/r3f-perf>

## 概要

[@react-three/fiber](../@react-three/fiber/README.md) の Canvas 内に FPS/CPU/GPU/Triangles 等を表示するパフォーマンスモニター。`box-bot-3d` は children slot 経由で `<Perf />` を受け取るのみで本体は依存しない。実際の注入は `box-bot/index.stories.tsx` の `Mode3D` story(`process.env.NODE_ENV === 'development'` 限定)で行う。複数 `BoxBot3D` を同時表示する story(`Sizes` 等)には設置しない。

## バージョン注意

内部で `@react-three/drei@9.x`(peer dependency `@react-three/fiber@^8`)をネスト依存として持つため、`yarn add` 時 `@react-three/fiber@^9.7.0`(本プロジェクト)との peer dependency 不一致警告が出る。動作確認は Storybook 上(`components-samples-figure-box-bot--mode-3-d`)で実施し、表示・FPS計測とも正常動作を確認済み。
