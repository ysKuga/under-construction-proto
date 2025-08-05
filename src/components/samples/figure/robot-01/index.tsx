import { CSSProperties } from 'react'

import { Assembly, AssemblyProps } from '@/components/ad/molecules'
import { Arm } from '@/prototypes/assembly/_parts/arm'
import { Body } from '@/prototypes/assembly/_parts/body'
import { Foot } from '@/prototypes/assembly/_parts/foot'
import { Head } from '@/prototypes/assembly/_parts/head'

/** Arm 用共通 style */
const armStyle = {
  top: '34%',
  ...{
    height: '30%',
    width: '7%',
  },
} satisfies CSSProperties

/** Foot 用共通 style */
const footStyle = {
  bottom: '3%',
  ...{
    height: '20%',
    width: '8%',
  },
} satisfies CSSProperties

export type Robot01Props = Omit<AssemblyProps, 'children'>

/**
 * ロボ 01
 */
export const Robot01 = (props: Robot01Props) => {
  const { className, style } = props

  return (
    <Assembly className={className} style={style}>
      <Head
        style={{
          top: '16%',
          ...{
            height: '15%',
            width: '25%',
          },
        }}
      />
      <Body
        style={{
          top: '34%',
          ...{
            height: '40%',
            width: '30%',
          },
        }}
      />
      <Arm
        style={{
          ...armStyle,
          left: '25%',
        }}
      />
      <Arm
        style={{
          ...armStyle,
          right: '25%',
        }}
      />
      <Foot
        style={{
          ...footStyle,
          left: '35%',
        }}
      />
      <Foot
        style={{
          ...footStyle,
          right: '35%',
        }}
      />
    </Assembly>
  )
}
