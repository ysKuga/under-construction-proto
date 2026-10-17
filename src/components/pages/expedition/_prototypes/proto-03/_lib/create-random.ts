/**
 * seed 付き疑似乱数生成器（mulberry32）を作る
 *
 * - 同じ seed からは同じ乱数列を返す。盤面生成の再現に使う（issue #315）
 * - 戻り値の関数は呼ぶたびに `[0, 1)` の値を返す
 *
 * @param seed 乱数の種（32bit 整数として扱う）
 */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0

    let t = state

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
