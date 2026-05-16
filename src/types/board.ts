export type PostCategory = 'FREE' | 'SHARE' | 'WINNING'

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  FREE: '자유게시판',
  SHARE: '번호공유',
  WINNING: '당첨후기',
}

export const CATEGORY_COLORS: Record<PostCategory, string> = {
  FREE: 'bg-blue-100 text-blue-700',
  SHARE: 'bg-violet-100 text-violet-700',
  WINNING: 'bg-amber-100 text-amber-700',
}

export interface PostListItem {
  id: number
  category: PostCategory
  title: string
  nickname: string
  views: number
  likesCount: number
  createdAt: string
  commentCount: number
}

export interface PostDetail {
  id: number
  category: PostCategory
  title: string
  content: string
  nickname: string
  views: number
  likesCount: number
  createdAt: string
  updatedAt: string
  comments: CommentItem[]
}

export interface CommentItem {
  id: number
  content: string
  nickname: string
  createdAt: string
}

export interface PostListResponse {
  posts: PostListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}