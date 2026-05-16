'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { PostDetail, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/board'
import { formatRelativeTime, getOrCreateVisitorId } from '@/lib/board-utils'
import PasswordModal from '@/components/PasswordModal'

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeAnimating, setLikeAnimating] = useState(false)

  // 댓글 폼
  const [commentNickname, setCommentNickname] = useState('')
  const [commentPassword, setCommentPassword] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState('')

  // 모달
  const [modal, setModal] = useState<{ type: 'delete' | 'deleteComment'; commentId?: number } | null>(null)

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/board/${postId}`)
      if (!res.ok) {
        setError('게시글을 찾을 수 없습니다.')
        return
      }
      const data: PostDetail = await res.json()
      setPost(data)
      setLikesCount(data.likesCount)

      // 좋아요 상태 체크
      const visitorId = getOrCreateVisitorId()
      const likedPosts: string[] = JSON.parse(localStorage.getItem('naeotto_liked') || '[]')
      setLiked(likedPosts.includes(`${postId}:${visitorId}`))
    } catch {
      setError('게시글을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchPost()
    const saved = localStorage.getItem('naeotto_nickname')
    if (saved) setCommentNickname(saved)
  }, [fetchPost])

  const handleLike = async () => {
    const visitorId = getOrCreateVisitorId()
    try {
      const res = await fetch(`/api/board/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      })
      const data = await res.json()
      if (res.ok) {
        setLiked(data.liked)
        setLikesCount(data.likesCount)
        setLikeAnimating(true)
        setTimeout(() => setLikeAnimating(false), 300)

        // localStorage 동기화
        const likedPosts: string[] = JSON.parse(localStorage.getItem('naeotto_liked') || '[]')
        const key = `${postId}:${visitorId}`
        if (data.liked) {
          likedPosts.push(key)
        } else {
          const idx = likedPosts.indexOf(key)
          if (idx > -1) likedPosts.splice(idx, 1)
        }
        localStorage.setItem('naeotto_liked', JSON.stringify(likedPosts))
      }
    } catch {
      // ignore
    }
  }

  const handleDelete = async (password: string) => {
    const res = await fetch(`/api/board/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setModal(null)
    router.push('/board')
  }

  const handleDeleteComment = async (password: string) => {
    if (!modal || modal.type !== 'deleteComment' || !modal.commentId) return
    const res = await fetch(`/api/board/${postId}/comments/${modal.commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setModal(null)
    // 댓글 목록 새로고침
    setPost(prev => prev ? {
      ...prev,
      comments: prev.comments.filter(c => c.id !== modal.commentId),
    } : null)
  }

  const handleSubmitComment = async () => {
    if (!commentNickname.trim()) return setCommentError('닉네임을 입력해주세요.')
    if (!commentPassword || commentPassword.length < 4) return setCommentError('비밀번호는 4자 이상 입력해주세요.')
    if (!commentContent.trim()) return setCommentError('댓글을 입력해주세요.')

    setCommentLoading(true)
    setCommentError('')

    try {
      const res = await fetch(`/api/board/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
          nickname: commentNickname,
          password: commentPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCommentError(data.error)
        return
      }

      localStorage.setItem('naeotto_nickname', commentNickname.trim())
      setPost(prev => prev ? { ...prev, comments: [...prev.comments, data] } : null)
      setCommentContent('')
      setCommentPassword('')
    } catch {
      setCommentError('네트워크 오류가 발생했습니다.')
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-gray-500 mb-4">{error || '게시글을 찾을 수 없습니다.'}</p>
          <Link href="/board" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium text-white transition-colors">
            목록으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <main className="max-w-3xl mx-auto px-4 py-5 sm:py-6 pb-24 lg:pb-6">
        {/* 뒤로가기 */}
        <Link href="/board" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        {/* 게시글 */}
        <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6">
          {/* 카테고리 + 메타 */}
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
              {CATEGORY_LABELS[post.category]}
            </span>
            <div className="flex gap-2">
              <Link
                href={`/board/${postId}/edit`}
                className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                수정
              </Link>
              <button
                onClick={() => setModal({ type: 'delete' })}
                className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>

          {/* 제목 */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{post.title}</h1>

          {/* 작성자 정보 */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 text-xs sm:text-sm text-gray-500">
            <span className="font-medium text-gray-700">{post.nickname}</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {post.views}
            </span>
          </div>

          {/* 본문 */}
          <div className="py-6 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-gray-700 min-h-[120px]">
            {post.content}
          </div>

          {/* 좋아요 */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all active:scale-90 ${
                liked
                  ? 'bg-pink-50 text-pink-500 border border-pink-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
              } ${likeAnimating ? 'scale-110' : ''}`}
            >
              <svg className={`w-5 h-5 transition-transform ${likeAnimating ? 'scale-125' : ''}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
          </div>
        </article>


        {/* 댓글 섹션 */}
        <section className="mt-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
            댓글 <span className="text-indigo-600">{post.comments.length}</span>
          </h2>

          {/* 댓글 목록 */}
          {post.comments.length > 0 ? (
            <div className="space-y-2 mb-6">
              {post.comments.map(comment => (
                <div key={comment.id} className="p-3.5 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">{comment.nickname}</span>
                      <span className="text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => setModal({ type: 'deleteComment', commentId: comment.id })}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6 mb-4">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          )}

          {/* 댓글 작성 폼 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                value={commentNickname}
                onChange={(e) => setCommentNickname(e.target.value)}
                placeholder="닉네임"
                maxLength={20}
                className="px-3 py-2 rounded-xl bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <input
                type="password"
                value={commentPassword}
                onChange={(e) => setCommentPassword(e.target.value)}
                placeholder="비밀번호 (4자 이상)"
                maxLength={20}
                className="px-3 py-2 rounded-xl bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 남겨보세요"
                maxLength={500}
                rows={2}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
              <button
                onClick={handleSubmitComment}
                disabled={commentLoading}
                className="px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 self-end py-2"
              >
                {commentLoading ? '...' : '등록'}
              </button>
            </div>
            {commentError && <p className="text-xs text-red-600 mt-2">{commentError}</p>}
          </div>
        </section>
      </main>

      {/* 비밀번호 모달 */}
      {modal?.type === 'delete' && (
        <PasswordModal
          title="게시글 삭제"
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'deleteComment' && (
        <PasswordModal
          title="댓글 삭제"
          onConfirm={handleDeleteComment}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}
