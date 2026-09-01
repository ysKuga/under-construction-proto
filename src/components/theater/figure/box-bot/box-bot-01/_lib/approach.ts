/** 指数減衰で cur を target へ(フレームレート非依存) */
export const approach = (cur: number, target: number, k: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-k * dt))
