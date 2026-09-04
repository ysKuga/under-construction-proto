# rxjs

<https://rxjs.dev/>

## 概要

時間軸を持つ入力・イベントの流れを Observable として宣言的に合成するためのライブラリ。

- ゲームの「長押し」など文脈のある操作（押下 → 保持 → 解放という時系列の組み合わせ）の判定に使う。
- 複雑な非同期処理・イベント連鎖を、状態フラグの積み上げでなく operator の合成で記述する。
- UI の見た目に干渉しない値の流れを Observable 側へ寄せ、React の再レンダリングと分離する（[docs/performance](../../../performance/README.md) の `useState` 判断基準を参照）。

## バージョン注意

- v7 系（`rxjs@7`）。特筆すべき peer dependency 制約はない。
- operator は `rxjs` から直接 import する（`rxjs/operators` サブパスは v7 で非推奨）。
