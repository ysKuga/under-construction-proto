import { expect, test } from 'vitest'

import {
  CellClickContext,
  classifyCellClick,
  isCellClickIgnored,
} from './classify-cell-click'

const context: CellClickContext = {
  canEnterCell: () => true,
  currentCell: { q: 0, r: 0 },
  flowState: 'idle',
}

test('現在マスは current', () => {
  expect(classifyCellClick({ q: 0, r: 0 }, context)).toBe('current')
})

test('進入可の隣接マスは move', () => {
  expect(classifyCellClick({ q: 1, r: 0 }, context)).toBe('move')
})

test('進入不可の隣接マスは objective', () => {
  expect(
    classifyCellClick(
      { q: 1, r: 0 },
      { ...context, canEnterCell: () => false },
    ),
  ).toBe('objective')
})

test('非隣接マスは objective', () => {
  expect(classifyCellClick({ q: 3, r: 0 }, context)).toBe('objective')
})

test('経路提示中の目標セルの再クリックは cancel-objective', () => {
  expect(
    classifyCellClick(
      { q: 3, r: 0 },
      { ...context, flowState: 'proposing', objectiveCell: { q: 3, r: 0 } },
    ),
  ).toBe('cancel-objective')
})

test('経路提示中でなければ目標セルの再クリックも objective', () => {
  expect(
    classifyCellClick(
      { q: 3, r: 0 },
      { ...context, flowState: 'idle', objectiveCell: { q: 3, r: 0 } },
    ),
  ).toBe('objective')
})

test('isCellClickIgnored は classifyCellClick の current と一致する', () => {
  const cells = [
    { q: 0, r: 0 },
    { q: 1, r: 0 },
    { q: 3, r: 0 },
  ]

  for (const cell of cells) {
    expect(isCellClickIgnored(cell, context.currentCell)).toBe(
      classifyCellClick(cell, context) === 'current',
    )
  }
})
