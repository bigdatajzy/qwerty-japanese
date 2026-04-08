export interface WordsManifest {
  schemaVersion: number
  kind: 'words-manifest'
  sets: WordSetManifest[]
}

export interface WordSetManifest {
  id: string
  title: string
  level: string
  description: string
  wordCount: number
  chunks: string[]
}

export interface ArticlesManifest {
  schemaVersion: number
  kind: 'articles-manifest'
  articles: ArticleListEntry[]
}

export interface ArticleListEntry {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  path: string
}
