import type { Article } from '@/types/article'

const PRESET_ARTICLE_IDS = ['article-1', 'article-2', 'article-3']
const articleCache = new Map<string, Article>()

export async function loadPresetArticle(id: string): Promise<Article | null> {
  if (articleCache.has(id)) {
    return articleCache.get(id)!
  }
  
  try {
    const response = await fetch(`/articles/${id}.json`)
    if (!response.ok) return null
    const article = await response.json() as Article
    articleCache.set(id, article)
    return article
  } catch (error) {
    console.error(`加载文章 ${id} 失败:`, error)
    return null
  }
}

export async function loadArticle(id: string): Promise<Article | null> {
  const preset = await loadPresetArticle(id)
  if (preset) return preset
  
  try {
    const stored = localStorage.getItem('custom-articles')
    if (stored) {
      const customArticles: Article[] = JSON.parse(stored)
      return customArticles.find(a => a.id === id) || null
    }
  } catch (e) {
    console.error('加载自定义文章失败', e)
  }
  return null
}
