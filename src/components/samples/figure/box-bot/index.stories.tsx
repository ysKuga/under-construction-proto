import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Perf } from 'r3f-perf'
import * as React from 'react'

import { StyledDiv } from '@/components/samples/_parts/_base/part-base'
import { Button } from '@/components/ui/button'

import { LEG_CYCLE_SEC } from './_components/box-bot-3d/_components/box-bot-model/index.constants'
import type { LegStyle } from './_components/box-bot-3d/_components/box-bot-model/index.types'
import { useBoxBotActionDispatcher } from './_components/box-bot-3d/_components/box-bot-model/use-box-bot-action-dispatcher'

import { BoxBot as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Mode2D: Story = {
  args: {
    mode: '2d',
  },
}

export const Mode3D: Story = {
  args: {
    mode: '3d',
  },
  render: (args) => (
    <StoryComponent {...args}>
      {process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
    </StoryComponent>
  ),
}

/** 3D、回転停止 */
export const Static: Story = {
  args: {
    autoRotate: false,
    interactive: false,
    mode: '3d',
    orbit: false,
  },
}

/** 3D、回転速度を変更 */
export const SlowRotate: Story = {
  args: {
    mode: '3d',
    rotateSpeed: 0.15,
  },
}

/** style 経由でサイズ変更 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <StoryComponent mode="3d" style={{ height: 320, width: 320 }} />
      <StoryComponent mode="3d" style={{ height: 200, width: 200 }} />
      <StoryComponent mode="3d" style={{ height: 120, width: 120 }} />
    </div>
  ),
}

/** 升目表示との組み合わせ */
export const Grid: Story = {
  render: () => {
    const cols = 5
    const rows = 3
    const cellSize = 72

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <StyledDiv key={i} style={{ position: 'relative' }}>
            {i === Math.floor((cols * rows) / 2) && (
              <StoryComponent
                mode="2d"
                style={{
                  height: cellSize,
                  position: 'absolute',
                  width: cellSize,
                }}
              />
            )}
          </StyledDiv>
        ))}
      </div>
    )
  },
}

/**
 * 基準 fov(deg)
 *
 * - Grid3D/Circle が意図した見た目のスケールを保つための基準値。BoxBot3D の\
 *   デフォルト fov とは独立させている。tan 比のスケーリング計算(`fovForScale`)は\
 *   非線形のため、BoxBot3D デフォルトに追従させると(fov を広げる方向の変更で)\
 *   Canvas 拡大率が同じでも実効 fov が急激に広がり、本体が縮小して見えてしまう
 */
const BASE_FOV = 42

/**
 * Canvas 拡大率ぶん fov を広げ、本体の見かけの大きさを一定に保つ
 *
 * - fov 固定のまま Canvas を拡大すると、同じ world サイズの本体がより多くのピクセルで描画され、本体自体が大きく見えてしまう。拡大率に応じて画角を広げることで、表示範囲(はみ出しの許容量)だけを広げる
 */
const fovForScale = (baseSize: number, canvasSize: number) =>
  (2 *
    Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) * (canvasSize / baseSize)) *
    180) /
  Math.PI

/** Grid3D の Canvas 拡大率。ジャンプ演出込みで頭が見切れない値 */
const GRID3D_CANVAS_SCALE = 2.8

/**
 * 升目表示との組み合わせ(3D)
 *
 * - ジャンプ演出(頭部が上昇)で頭が Canvas 上端を超えないよう、Canvas 自体はセルよりも一回り大きく確保し、fov で本体の見かけの大きさを維持する
 */
export const Grid3D: Story = {
  render: () => {
    const cols = 5
    const rows = 3
    const cellSize = 96
    const canvasSize = cellSize * GRID3D_CANVAS_SCALE

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <StyledDiv key={i} style={{ position: 'relative' }}>
            {i === Math.floor((cols * rows) / 2) && (
              <StoryComponent
                fov={fovForScale(cellSize, canvasSize)}
                mode="3d"
                orbit={false}
                style={{
                  height: canvasSize,
                  left: '50%',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: canvasSize,
                  zIndex: 1,
                }}
              />
            )}
          </StyledDiv>
        ))}
      </div>
    )
  },
}

/**
 * 腕含む本体シルエットの実測幅(px)
 *
 * - cellSize = 120 のときの値。box-bot-3d のカメラ設定(fov/ORBIT_TARGET)に\
 *   依存するため、それらを変更した場合は再計測が必要
 */
const BODY_WIDTH_AT_120 = 51
/**
 * 腕含む本体シルエットの実測高さ(px)
 *
 * - cellSize = 120 のときの値。box-bot-3d のカメラ設定(fov/ORBIT_TARGET)に\
 *   依存するため、それらを変更した場合は再計測が必要
 */
const BODY_HEIGHT_AT_120 = 48
/** 隣接ペアの重なり量(本体サイズに対する比率) */
const OVERLAP_RATIO = 0.25

/** 中心間距離が size*(1-OVERLAP_RATIO) になるよう、セル index 1 つぶんの寄せ量を返す */
const overlapOffsetPerIndex = (bodySize: number, cellSize: number) =>
  bodySize * (1 - OVERLAP_RATIO) - cellSize

/**
 * three(WebGL) 実装同士が重なり合った場合の見え方を確認
 *
 * - 本体の 1/4 ほどが隣とだけ重なるよう、セル間隔を本体サイズ基準まで詰める(セル index に比例したオフセットの累積で表現)。縦横で本体の幅・高さが異なるため、それぞれ別に計算する。zIndex で重なり順を明示
 * - Canvas 同士が重なると、上の Canvas が透明部分もヒットテストを奪うため下側の本体はクリックできない(WebGL 描画は DOM 上ただの矩形として扱われ、透明ピクセルを判定してクリックを下へ透過させる標準機構がない)。ここでは表示確認が目的のため interactive を無効にしている
 */
export const OverlapGrid3D: Story = {
  render: () => {
    const cols = 3
    const rows = 2
    const cellSize = 120

    const offsetPerCol = overlapOffsetPerIndex(BODY_WIDTH_AT_120, cellSize)
    const offsetPerRow = overlapOffsetPerIndex(BODY_HEIGHT_AT_120, cellSize)

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const dx = col * offsetPerCol
          const dy = row * offsetPerRow

          return (
            <StyledDiv key={i} style={{ position: 'relative' }}>
              <StoryComponent
                interactive={false}
                mode="3d"
                orbit={false}
                style={{
                  height: cellSize,
                  left: dx,
                  position: 'absolute',
                  top: dy,
                  width: cellSize,
                  zIndex: i,
                }}
              />
            </StyledDiv>
          )
        })}
      </div>
    )
  },
}

/** Circle の円のサイズ(px) */
const CIRCLE_SIZE = 240
/** Circle の canvasSize デフォルト値(px) */
const CIRCLE_DEFAULT_CANVAS_SIZE = 360
/** Circle の shadowScale。円内に影が収まる値 */
const CIRCLE_SHADOW_SCALE = 2.5

/**
 * 円形の背景の上に本体を重ねて表示
 *
 * - Canvas は 1 枚のラスタのため、border-radius + overflow:hidden でクリップすると本体も影も一律に切り取られる。ここでは円形の背景 div と、クリップしない一回り大きい Canvas を重ね、本体が円の外へはみ出せるようにする
 * - canvasSize(Canvas の一辺)は控え目にすると見切れの原因になるため、args から調整可能にしておく。本体の見かけの大きさが変わらないよう、拡大率に応じて fov も合わせて調整する
 */
export const Circle: StoryObj<{
  /**
   * Canvas の一辺(px)
   *
   * - 円より大きくするほどはみ出しの許容量が増える
   */
  canvasSize?: number
}> = {
  args: {
    canvasSize: CIRCLE_DEFAULT_CANVAS_SIZE,
  },
  argTypes: {
    canvasSize: {
      control: { max: 800, min: CIRCLE_SIZE, step: 20, type: 'range' },
    },
  },
  render: (args) => {
    const circleSize = CIRCLE_SIZE
    const canvasSize = args.canvasSize ?? CIRCLE_DEFAULT_CANVAS_SIZE
    const padding = (canvasSize - circleSize) / 2

    return (
      <div style={{ padding }}>
        <div
          style={{
            height: circleSize,
            position: 'relative',
            width: circleSize,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '50%',
              inset: 0,
              position: 'absolute',
            }}
          />
          <StoryComponent
            fov={fovForScale(circleSize, canvasSize)}
            mode="3d"
            shadowScale={CIRCLE_SHADOW_SCALE}
            style={{
              height: canvasSize,
              left: '50%',
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: canvasSize,
            }}
          />
        </div>
      </div>
    )
  },
}

type WalkingArgs = {
  /** body 全体の bobbing を有効にするか */
  bodyBobbing?: boolean
}

/**
 * walking(脚 swing)・marching(脚 bob)action の挙動確認
 *
 * - 歩く/止まるボタン + 歩き方(swing/bob)の切替 + 速度スライダーを画面内に直接配置し、\
 *   body bobbing の有効/無効(Controls パネル)と組合せて確認できる。body bobbing は\
 *   脚の実際の動きから高さを計算するため、常に連動する
 * - マウント時に自動で歩き始める。`BoxBotModel` の `autoWalk` props で Canvas 内部\
 *   (マウント完了後)から直接 ref をセットする。r3f の Canvas は別 reconciler root で\
 *   非同期に初期化されるため、外部の `useEffect` から `useBoxBotActionDispatcher` 経由で\
 *   toggle を発行すると listener 登録前にイベントが発行されるタイミング競合の余地があり、\
 *   その回避のため
 * - 歩行中に legStyle を切り替えると、その場で歩き方が変わる(旧方式を止めて新方式を開始する)。\
 *   こちらは Canvas マウント後の操作のためタイミング競合がなく、\
 *   `useBoxBotActionDispatcher` 経由の toggle のままでよい
 */
export const Walking: StoryObj<WalkingArgs> = {
  args: {
    bodyBobbing: true,
  },
  argTypes: {
    bodyBobbing: { control: 'boolean' },
  },
  render: (args) => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { marchingToggle, walkingToggle } =
      useBoxBotActionDispatcher(eventTarget)
    const [walking, setWalking] = React.useState(true)
    const [legStyle, setLegStyle] = React.useState<LegStyle>('swing')
    const [legCycle, setLegCycle] = React.useState(LEG_CYCLE_SEC)
    const legStyleRef = React.useRef(legStyle)

    const toggleByStyle = (style: LegStyle) => {
      if (style === 'bob') void marchingToggle()
      else void walkingToggle()
    }

    // legStyle 切替。歩行中のみ、旧方式を止めて新方式を開始する(初回マウントは
    // autoWalk props に任せるため、legStyleRef の初期値と一致し何もしない)
    React.useEffect(() => {
      if (legStyleRef.current === legStyle) return
      if (walking) {
        toggleByStyle(legStyleRef.current)
        toggleByStyle(legStyle)
      }
      legStyleRef.current = legStyle
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [legStyle])

    return (
      <div>
        <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
          <Button
            onClick={() => {
              toggleByStyle(legStyle)
              setWalking((v) => !v)
            }}
            type="button"
            variant="outline"
          >
            {walking ? 'Stop' : 'Walk'}
          </Button>
          <select
            onChange={(e) => setLegStyle(e.target.value as LegStyle)}
            value={legStyle}
          >
            <option value="swing">swing</option>
            <option value="bob">bob</option>
          </select>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            speed
            <input
              max={2}
              min={0.1}
              onChange={(e) => setLegCycle(Number(e.target.value))}
              step={0.05}
              type="range"
              value={legCycle}
            />
          </label>
        </div>
        <StoryComponent
          autoWalk={legStyle}
          bodyBobbing={args.bodyBobbing}
          eventTarget={eventTarget}
          legCycle={legCycle}
          mode="3d"
        />
      </div>
    )
  },
}

/**
 * fall(転倒)・getUp(起き上がり)action の挙動確認
 *
 * - 直立時のみ fall が、倒れている時のみ getUp が実際に発火する(内部ガード)。\
 *   誤ったタイミングでクリックしても無視されるだけなので、ボタンは常時 2 つとも表示する
 * - addon パネル(Controls/Actions 等)を無効化しつつ、Canvas 高さも既定(480px)より\
 *   低くしている。狭いウィンドウでも、パネルの有無に関わらず Canvas 自体の絶対的な\
 *   高さがビューポートを超えれば見切れるため、両方の対策が必要だった。args を持たない\
 *   story のため showPanel 無効化に実害なし
 */
export const Fall: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall, getUp } = useBoxBotActionDispatcher(eventTarget)

    return (
      <div>
        <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
          <Button onClick={() => void fall()} type="button" variant="outline">
            Fall
          </Button>
          <Button onClick={() => void getUp()} type="button" variant="outline">
            Get Up
          </Button>
        </div>
        <StoryComponent
          eventTarget={eventTarget}
          mode="3d"
          style={{ height: 300 }}
        />
      </div>
    )
  },
}
