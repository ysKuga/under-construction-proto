import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defineTerm } from './define-term'

describe('defineTerm', () => {
  it('英語名称から className を導出する', () => {
    const term = defineTerm({
      description: 'エネルギーを補給するアイテム',
      englishName: 'energy-recovery-item',
      name: '補給アイテム',
    })

    expect(term.className).toBe('ui-term-energy-recovery-item')
  })

  it('component 未指定時は何も描画しない component とする', () => {
    const term = defineTerm({
      description: '通行できないマス',
      englishName: 'obstacle',
      name: '障害物',
    })

    expect(render(<term.component />).container).toBeEmptyDOMElement()
  })

  it('component へ className 付与済みの用語情報を渡し、displayName を付与する', () => {
    const term = defineTerm(
      {
        description: 'エネルギーを補給するアイテム',
        englishName: 'energy-recovery-item',
        name: '補給アイテム',
      },
      (info) => () => info.className,
    )

    expect(render(<term.component />).container).toHaveTextContent(
      'ui-term-energy-recovery-item',
    )
    expect(term.component.displayName).toBe('EnergyRecoveryItemComponent')
  })
})
