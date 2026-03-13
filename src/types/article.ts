export interface Article {
  id: string
  title: string
  content: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  source: 'preset' | 'custom'
  author?: string
}

export interface ArticleCategory {
  id: string
  name: string
  description: string
}
