import type { Article } from '@/types/article'
import type { ArticleListEntry, ArticlesManifest } from '@/types/dataManifest'

const basePath = import.meta.env.BASE_URL

function assetUrl(relativePath: string): string {
  const p = relativePath.replace(/^\//, '')
  return `${basePath}${p}`
}

const articleCache = new Map<string, Article>()
let articlesManifestCache: ArticlesManifest | null = null

export function clearArticlesManifestCache(): void {
  articlesManifestCache = null
}

export async function fetchArticlesManifest(): Promise<ArticlesManifest> {
  if (articlesManifestCache) return articlesManifestCache
  const res = await fetch(assetUrl('data/articles/manifest.json'))
  if (!res.ok) throw new Error(`articles manifest: ${res.status}`)
  articlesManifestCache = (await res.json()) as ArticlesManifest
  return articlesManifestCache
}

export async function loadPresetArticlesList(): Promise<ArticleListEntry[]> {
  const m = await fetchArticlesManifest()
  return m.articles
}

export async function loadPresetArticle(id: string): Promise<Article | null> {
  if (id.startsWith('custom-')) return null

  if (articleCache.has(id)) {
    return articleCache.get(id)!
  }

  try {
    const m = await fetchArticlesManifest()
    const entry = m.articles.find((a) => a.id === id)
    if (!entry) return null

    const response = await fetch(assetUrl(entry.path))
    if (!response.ok) return null
    const article = (await response.json()) as Article
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
      return customArticles.find((a) => a.id === id) || null
    }
  } catch (e) {
    console.error('加载自定义文章失败', e)
  }
  return null
}
