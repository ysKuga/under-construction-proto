import { describe, expect, it } from 'vitest'

import { defineTerm } from './define-term'

describe('defineTerm', () => {
  it('英語名称から className を導出する', () => {
    const term = defineTerm({
      component: () => null,
      description: 'エネルギーを回復するアイテム',
      englishName: 'energy-recovery-item',
      name: '回復アイテム',
    })

    expect(term.className).toBe('ui-term-energy-recovery-item')
  })
})
