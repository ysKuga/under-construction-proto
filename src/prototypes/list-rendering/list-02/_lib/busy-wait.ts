/**
 * 意図的にメインスレッドを ms 分だけ同期的にブロックする
 * - useTransition の効果を体感できるようにするための人工的な重さ
 */
export const busyWait = (ms: number) => {
  const start = performance.now()
  while (performance.now() - start < ms) {
    // 意図的な busy wait
  }
}
