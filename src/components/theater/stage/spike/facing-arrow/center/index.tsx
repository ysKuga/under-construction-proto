import { FacingArrowProps } from '../types'

/**
 * 向き矢印(中心回転)
 *
 * - 右向きの矢印(切り欠き付き三角)を、矢印自身の中心で回転させる
 */
export const FacingArrowCenter = (props: FacingArrowProps) => {
  const { ref } = props

  return (
    <div className="size-16">
      <div className="size-full transition-transform duration-150" ref={ref}>
        <svg className="size-full" viewBox="-1 -1 2 2">
          <polygon
            fill="currentColor"
            points="0.8,0 -0.6,0.55 -0.3,0 -0.6,-0.55"
          />
        </svg>
      </div>
    </div>
  )
}
