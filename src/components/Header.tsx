'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const navItems = [
  { href: '/', label: '번호 추천' },
  { href: '/stats', label: '통계' },
  { href: '/blog', label: '블로그' },
  { href: '/board', label: '커뮤니티' },
  { href: '/guide', label: '가이드' },
]

export default function Header() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // 스크롤 다운 시 숨기기, 업 시 보이기 (50px 이상 스크롤 시에만)
      if (y > 80 && y - lastY.current > 10) {
        setHidden(true)
      } else if (lastY.current - y > 10 || y < 50) {
        setHidden(false)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-extrabold text-indigo-600 tracking-tight">Lotto45</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* 모바일: 현재 페이지 표시 */}
        <div className="sm:hidden flex items-center gap-1">
          <Link href="/stats" className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg">
            통계
          </Link>
          <Link href="/blog" className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg">
            블로그
          </Link>
        </div>
      </div>
    </header>
  )
}