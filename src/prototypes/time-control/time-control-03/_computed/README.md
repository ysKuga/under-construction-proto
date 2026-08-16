# time-control-03/_computed

props・store から算出する派生値 (computed) を保持する。「全 actor 常に同一 progressMode 前提」のような、TimeControl03 スコープでのみ意味を持つ判断を1箇所に集約し、`ActionBar` 等の個別 component へ埋め込まない。

## 構成

```
_computed/
  index.ts             # 外部公開用の集約 index (index.contexts / store を re-export)
  index.contexts.tsx   # ComputedProvider。props(actorIds)・actor-settings-store から
                        # 派生値を算出し、Context として配布する。ComputedStoreContext /
                        # useTimeControl03Computed もここで定義する
  store.ts              # createComputedStore。zustand vanilla store として派生値を保持し、
                         # 依存元 store の変化に追従して再計算する
  types.ts               # ComputedState (派生値の型) / ComputedStore
```

`_stores` の各 store と同様、zustand vanilla store として実装する。selector 購読 (`useTimeControl03Computed`) により、派生値を実際に参照する component のみが再レンダリング対象になる (Context value に生 store インスタンスを乗せているため、値そのものの変化では Provider 配下は再レンダリングされない)。

## 依存関係

- `props` (`TimeControl03Props` の `actorIds`): 算出対象の actor を決める
- `_stores` (`actor-settings-store`): `progressMode` の算出元。`useActorSettingsStoreApi` (生 store) を購読し、変化のたびに再算出する

`ComputedProvider` は `actor-settings-store` の Context を参照するため、`StoresProvider` の内側に配置する前提。`_computed → _stores` の一方向依存になる (`_stores` 側は `_computed` を一切知らない)。

## 参照ルール

`_computed` の外部消費者 (`action-bar` 等の component/hooks) は集約 index (`_computed`) 経由で参照する。

## 新しい computed 値を追加する手順

1. `types.ts` の `ComputedState` にフィールドを追加する
2. `store.ts` の `createComputedStore` で算出ロジックと、依存元 store の `subscribe` による再算出を追加する
3. 依存元 store が `actor-settings-store` 以外なら、`index.contexts.tsx` の `ComputedProvider` で該当 store の `useXxxStoreApi` を取得し `createComputedStore` へ渡す

## 関連

- 概念: [docs/concept/component-input-layers/README.md](../../../../../docs/concept/component-input-layers/README.md)
- 実装計画・決定事項: `.claude/.steering/20260817-time-control-03-computed-layer/design.md`
- 実装例・store 構成: [time-control-03/README.md](../README.md)
