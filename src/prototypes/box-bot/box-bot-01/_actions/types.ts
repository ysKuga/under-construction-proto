/**
 * per-action 設定の外部上書き (`actionConfig` prop / host)
 *
 * - キー = アクション名、値 = そのアクションの設定の部分指定
 * - 厳密なキー・値型は外殻 (`BoxBot3DProps`) が `BoxBotActionConfigs` で付け直す。\
 *   box-bot-model 内部はアクション名を静的に知らないため緩い形で受ける
 */
export type ActionConfigOverrides = Record<
  string,
  Record<string, unknown> | undefined
>

/** アクション一覧を受け取る箇所で使う、引数型・設定型を問わない `BoxBotAction` */
export type AnyBoxBotAction = BoxBotAction<string, unknown, unknown>

/**
 * box-bot アクションの定義
 *
 * - 1 アクション = 1 フォルダ(`_actions/<name>/`)がこの descriptor を 1 つ export する
 * - `use()` は Canvas 内で実行される購読・可視化フック。固有の ref はその中で `useRef` する
 * - `defaults` を持つアクションは、その値と `actionConfig` 上書きをマージした結果が\
 *   `use()` の `host.config` に型付きで渡る(マージは `defineAction` が行う)
 *
 * @typeParam Name アクション名(dispatcher のキーになる)
 * @typeParam Arg dispatch 時に渡せる 1 回上書きの型(無ければ `never`)
 * @typeParam Config `defaults` / `host.config` の型(設定を持たなければ `never`)
 */
export type BoxBotAction<
  Name extends string = string,
  Arg = never,
  Config = never,
> = {
  /** dispatch 引数の型マーカー。値は保持しない */
  arg?: Arg
  /** このアクションの設定の既定値。`host.config` の下地になる */
  defaults?: Config
  /** dispatch が投げる CustomEvent の type */
  event: string
  /** dispatcher のキー */
  name: Name
  /** Canvas 内で実行する購読・可視化フック(`defineAction` がラップ済み) */
  use: (host: BoxBotActionBaseHost) => void
}

/**
 * orchestrator (`useBoxBotModel`) が組み立てる、`config` 差し込み前の host
 *
 * - Canvas 内で 1 度だけ組み立て、全アクションで共有する
 * - `actionConfig` は `defineAction` のラッパーだけが参照する(各アクションには渡らない)
 */
export type BoxBotActionBaseHost = {
  /** アクション名をキーにした設定の外部上書き(`defineAction` のラッパーが参照) */
  actionConfig?: ActionConfigOverrides
} & BoxBotActionHost

/**
 * アクション配列から per-action 設定の型を導出する(`actionConfig` prop の厳密型)
 *
 * - `defaults` を持つアクションだけがキーになる
 */
export type BoxBotActionConfigs<
  T extends readonly BoxBotAction<string, unknown, unknown>[],
> = {
  [
    A in T[number] as [A['defaults']] extends [undefined] ? never : A['name']
  ]: NonNullable<A['defaults']>
}

/**
 * 各 box-bot アクションの `use()` が受け取る host
 *
 * - `BoxBotActionHost` に、解決済みの `config` を加えたもの
 * - `config` は `defineAction` のラッパーがアクションごとに差し込む
 *
 * @typeParam Config このアクションの設定型(`defineAction` の `Config`)
 */
export type BoxBotActionContext<Config = never> = {
  /** このアクションの解決済み設定(`defaults` ← `actionConfig` 上書き) */
  config: Config
} & BoxBotActionHost

/**
 * アクション配列から `useBoxBotActionDispatcher` の該当メソッド群の型を導出する
 *
 * - 引数型 `Arg` が `never` のアクションは `() => Promise<void>`、\
 *   それ以外は `(override?: Arg) => Promise<void>` になる
 */
export type BoxBotActionDispatchers<
  T extends readonly BoxBotAction<string, unknown, unknown>[],
> = {
  [A in T[number] as A['name']]: [NonNullable<A['arg']>] extends [never]
    ? () => Promise<void>
    : (override?: NonNullable<A['arg']>) => Promise<void>
}

/**
 * 各アクションの `use()` へ adapter (box-bot-model) が渡す操作面
 *
 * - bot 内部構造(THREE.Group / 表示領域 DOM)へは触れさせず、意図レベルの操作だけ公開する
 * - 各アクションは自分が使うメンバだけを `Pick` した narrow な host 型で受け取る\
 *   (`_actions/<name>/use-*.ts` の `JumpHost` / `SpinHost` 等)
 */
export type BoxBotActionHost = {
  /**
   * 両腕の前方スイング角を設定する(絶対値)
   *
   * - `rad` は肩を支点にした x 軸回転。adapter が左右の腕グループの `rotation.x` へ反映する
   */
  applyArmAngle: (rad: number) => void
  /**
   * 接地影を world +y へ持ち上げる(絶対値)
   *
   * - `y` は world 単位。adapter が影グループの `position.y` へ反映する
   * - fall が横倒し時に体が浮くぶん影を体へ寄せるのに使う。直立時は 0
   */
  applyShadowLift: (y: number) => void
  /**
   * 表示領域(Canvas ラッパー)を基準位置(中央)からずらす
   *
   * - `x` は画面右、`y` は画面上を正とする px。adapter が DOM の `left` / `top` を書き換える(#108)
   * - jump は縦移動(`{ x: 0, y: lift }`)、fall は横倒し時の倒れ込みずらしに使う
   */
  applyShift: (offset: { x: number; y: number }) => void
  /**
   * squash(潰し)を適用する
   *
   * - `sx` は x/z 軸、`sy` は y 軸の倍率。adapter が全体グループの `scale` へ反映する
   */
  applySquash: (sx: number, sy: number) => void
  /**
   * 前傾角を設定する(絶対値)
   *
   * - `rad` はシルエット中心まわりの x 軸回転。adapter が `fallPivotRef` グループの `rotation.x` へ反映する
   * - 足元の辻褄(横倒し時に足元が前方へ出た見た目)は `applyShift` の表示領域ずらしで合わせる(#108)
   */
  applyTiltAngle: (rad: number) => void
  /**
   * yaw(y 軸回転)を増分で加える
   *
   * - `rad` はこのフレームで加算する角度。adapter が回転グループの `rotation.y` へ加算する
   */
  applyYawDelta: (rad: number) => void
  /** action イベント発行/購読に使う EventTarget */
  eventTarget: EventTarget
  /** クリック操作が有効か。無効時はアクションを起動しない */
  interactive: boolean
  /**
   * 現在の実効 facing(bot の向き、rad)を返す
   *
   * - `rotationY`(初期回転 prop)+ `yawRef` の累積回転(spin / autoRotate)
   * - 0 = カメラ正面(world +z)。fall が倒れ始めに固定し、画面ずらし方向の基準にする
   */
  readFacing: () => number
}
