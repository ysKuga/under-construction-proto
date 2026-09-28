import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TermLabel } from '.'

/** テスト用の用語情報 */
const term = {
  className: 'ui-term-obstacle',
  description: '通行できないマス',
}

describe('TermLabel', () => {
  it('既定では span で囲み className と説明を付与する', () => {
    const { container } = render(<TermLabel term={term}>🪨</TermLabel>)

    const element = container.firstElementChild

    expect(element?.tagName).toBe('SPAN')
    expect(element).toHaveClass('ui-term-obstacle')
    expect(element).toHaveAttribute('title', '通行できないマス')
  })

  it('as で指定したタグで囲む', () => {
    const { container } = render(
      <TermLabel as="div" term={term}>
        🪨
      </TermLabel>,
    )

    expect(container.firstElementChild?.tagName).toBe('DIV')
  })

  it('as が null の場合はタグで囲まず内容のみ描画する', () => {
    const { container } = render(
      <TermLabel as={null} term={term}>
        🪨
      </TermLabel>,
    )

    expect(container.innerHTML).toBe('🪨')
  })
})
