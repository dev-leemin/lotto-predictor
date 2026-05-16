'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PostCategory, CATEGORY_LABELS } from '@/types/board'

export default function WritePage() {
  const router = useRouter()
  const [category, setCategory] = useState<PostCategory>('FREE')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // localStorage에서 마지막 닉네임 복원
  useEffect(() => {
    const saved = localStorage.getItem('naeotto_nickname')
    if (saved) setNickname(saved)
  }, [])

  // 뒤로가기 방지
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSubmit = async () => {
    if (!nickname.trim()) return setError('닉네임을 입력해주세요.')
    if (!password || password.length < 4) return setError('비밀번호는 4자 이상 입력해주세요.')
    if (!title.trim()) return setError('제목을 입력해주세요.')
    if (!content.trim()) return setError('내용을 입력해주세요.')

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title, content, nickname, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '작성 중 오류가 발생했습니다.')
        return
      }

      // 닉네임 저장
      localStorage.setItem('naeotto_nickname', nickname.trim())
      setIsDirty(false)
      router.push(`/board/${data.id}`)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const categories: PostCategory[] = ['FREE', 'SHARE', 'WINNING']

  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-24 lg:pb-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">글쓰기</h1>
        </div>

        <div className="space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">카테고리</label>
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setIsDirty(true) }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/15'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* 닉네임 & 비밀번호 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setIsDirty(true) }}
                placeholder="닉네임"
                maxLength={20}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setIsDirty(true) }}
                placeholder="수정/삭제용"
                maxLength={20}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

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
              onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
              placeholder="제목을 입력해주세요"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
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
              onChange={(e) => { setContent(e.target.value); setIsDirty(true) }}
              placeholder="내용을 입력해주세요"
              maxLength={10000}
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none leading-relaxed"
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
              disabled={loading}
              className="flex-[2] px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? '작성 중...' : '작성하기'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
