/**
 * 操作候補ラベル(A〜E相当)
 *
 * - box-bot 未接続の action(armLeftToggle/armRightToggle/fall/getUp/marchingToggle)に仮で紐づけた単語
 * - 配置バリエーション(`../row` 等)間で共有する
 */
export const ACTION_LABELS = [
  '左腕',
  '右腕',
  '転倒',
  '起き上がり',
  '足踏み',
] as const
