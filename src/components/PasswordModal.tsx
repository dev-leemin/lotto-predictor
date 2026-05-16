'use client'

import { useState } from 'react'

interface PasswordModalProps {
  title: string
  onConfirm: (password: string) => Promise<void>
  onCancel: () => void
}

export default function PasswordModal({ title, onConfirm, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="비밀번호 입력"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors mb-3"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '확인 중...' : '확인'}
          </button>
        </div>
      </div>
    </div>
  )
}