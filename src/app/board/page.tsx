'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PostListItem, PostListResponse, PostCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/board'
import { formatRelativeTime } from '@/lib/board-utils'

type CategoryFilter = 'ALL' | PostCategory
type SortType = 'latest' | 'popular' | 'views'

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <BoardContent />
    </Suspense>
  )
}

function BoardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [posts, setPosts] = useState<PostListItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const currentCategory = (searchParams.get('category') || 'ALL') as CategoryFilter
  const currentSort = (searchParams.get('sort') || 'latest') as SortType
  const currentPage = parseInt(searchParams.get('page') || '1')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (currentCategory !== 'ALL') params.set('category', currentCategory)
      params.set('page', String(currentPage))
      params.set('sort', currentSort)

      const res = await fetch(`/api/board?${params}`)
      const data: PostListResponse = await res.json()
      setPosts(data.posts)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch {
      console.error('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [currentCategory, currentPage, currentSort])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === 'ALL' || v === 'latest' || v === '1') {
        params.delete(k)
      } else {
        params.set(k, v)
      }
    })
    router.push(`/board?${params.toString()}`)
  }

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'FREE', label: '자유' },
    { key: 'SHARE', label: '번호공유' },
    { key: 'WINNING', label: '당첨후기' },
  ]

  const sorts: { key: SortType; label: string }[] = [
    { key: 'latest', label: '최신' },
    { key: 'popular', label: '인기' },
    { key: 'views', label: '조회수' },
  ]

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 py-5 sm:py-6 pb-24 lg:pb-6">
        {/* 커뮤니티 소개 */}
        <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Lotto45 커뮤니티</h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            로또 번호 공유, 당첨 후기, 분석 토론 등 로또에 관한 자유로운 이야기를 나누는 공간입니다.
            다른 회원들의 번호 선택 전략을 참고하거나, 본인만의 분석 방법을 공유해보세요.
          </p>
          <p className="text-xs text-gray-400">
            총 {total}개의 게시글 | 건전한 복권 문화를 위해 상호 존중하는 대화를 부탁드립니다.
          </p>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="flex items-center justify-end mb-4 sm:mb-5">
          <div></div>
          <Link
            href="/board/write"
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/15"
          >
            글쓰기
          </Link>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => updateParams({ category: cat.key, page: '1' })}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                currentCategory === cat.key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/15'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 정렬 */}
        <div className="flex gap-1.5 mb-4">
          {sorts.map(s => (
            <button
              key={s.key}
              onClick={() => updateParams({ sort: s.key, page: '1' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                currentSort === s.key
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500 text-sm">아직 게시글이 없습니다</p>
            <Link
              href="/board/write"
              className="inline-block mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium text-white transition-colors"
            >
              첫 글 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post, idx) => (
              <div key={post.id}>
                <Link
                  href={`/board/${post.id}`}
                  className="block p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
                          {CATEGORY_LABELS[post.category]}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {post.title}
                        {post.commentCount > 0 && (
                          <span className="ml-1.5 text-indigo-600 text-xs font-normal">[{post.commentCount}]</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-xs text-gray-400">
                        <span>{post.nickname}</span>
                        <span>{formatRelativeTime(post.createdAt)}</span>
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          {post.views}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                          {post.likesCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            <button
              onClick={() => updateParams({ page: String(Math.max(1, currentPage - 1)) })}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-colors text-gray-600"
            >
              ←
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => updateParams({ page: String(pageNum) })}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => updateParams({ page: String(Math.min(totalPages, currentPage + 1)) })}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-colors text-gray-600"
            >
              →
            </button>
          </div>
        )}

        {/* 관련 콘텐츠 안내 */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">더 많은 로또 정보가 궁금하다면?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/blog" className="text-xs font-medium text-indigo-600 hover:underline">블로그 읽기</a>
            <a href="/stats" className="text-xs font-medium text-indigo-600 hover:underline">당첨 통계 보기</a>
            <a href="/tax-calculator" className="text-xs font-medium text-indigo-600 hover:underline">세금 계산기</a>
          </div>
        </div>
      </main>

      {/* 모바일 글쓰기 FAB */}
      <Link
        href="/board/write"
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/20 active:scale-90 transition-transform z-40"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}
