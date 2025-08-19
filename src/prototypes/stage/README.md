# Stage

stage の実装を行う。

## layer の分割

地形、 actor の描画を別コンポーネントにて行う。

### layer の串刺し

actor の action や position の管理、変更について stage を囲う形で context を設置する？

- geo context
  - stage の geo の構造について管理
  - Stage03 時点では props にて指定しており串刺しの管理は行っていない。
- actors position context
  - geo context を考慮して actors の position を管理

## `串刺し` について

`串刺し` は Gemini で確認した `aspect` がよいか？
