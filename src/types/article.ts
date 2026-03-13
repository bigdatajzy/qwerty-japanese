export interface RubyWord {
  word: string
  kana: string[]
}

export interface ContentBlock {
  text: string
  ruby?: RubyWord[]
}

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
