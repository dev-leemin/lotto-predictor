'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/board/${postId}`)
        if (!res.ok) {
          setError('게시글을 찾을 수 없습니다.')
          return
        }
        const data = await res.json()
        setTitle(data.title)
        setContent(data.content)
      } catch {
        setError('게시글을 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  const handleSubmit = async () => {
    if (!title.trim()) return setError('제목을 입력해주세요.')
    if (!content.trim()) return setError('내용을 입력해주세요.')
    if (!password) return setError('비밀번호를 입력해주세요.')

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/board/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push(`/board/${postId}`)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-24 lg:pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">글 수정</h1>
        </div>

        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500">제목</label>
              <span className={`text-xs ${title.length > 90 ? 'text-red-400' : 'text-gray-400'}`}>
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* 내용 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500">내용</label>
              <span className={`text-xs ${content.length > 9500 ? 'text-red-400' : 'text-gray-400'}`}>
                {content.length}/10000
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none leading-relaxed"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">비밀번호 확인</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="글 작성 시 입력한 비밀번호"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* 에러 */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-[2] px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
