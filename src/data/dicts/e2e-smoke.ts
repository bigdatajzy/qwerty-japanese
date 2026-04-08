import type { Dict } from '@/types/dict'

/** 仅注册到 allDicts 供 E2E 直达路由使用，不出现在首页词库列表 */
export const e2eSmokeDict: Dict = {
  id: 'e2e-smoke',
  name: 'E2E 烟雾',
  description: '自动化测试',
  type: 'hiragana',
  words: [
    { id: 'a', kana: 'あ', romaji: 'a' },
    { id: 'i', kana: 'い', romaji: 'i' },
  ],
}
