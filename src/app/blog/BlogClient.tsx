'use client'

import { useState } from 'react'
import { blogPosts } from '@/data/blog-posts'

const categoryColors: Record<string, string> = {
  '당첨 가이드': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '심리 분석': 'bg-purple-100 text-purple-700 border-purple-200',
  '역대 기록': 'bg-amber-100 text-amber-700 border-amber-200',
  '확률 분석': 'bg-pink-100 text-pink-700 border-pink-200',
  '전략 가이드': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '복권 비교': 'bg-orange-100 text-orange-700 border-orange-200',
  '당첨 분석': 'bg-blue-100 text-blue-700 border-blue-200',
  '데이터 분석': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '세금 가이드': 'bg-red-100 text-red-700 border-red-200',
  '칼럼': 'bg-teal-100 text-teal-700 border-teal-200',
  '초보자 가이드': 'bg-sky-100 text-sky-700 border-sky-200',
  '세금/재무': 'bg-red-100 text-red-700 border-red-200',
  '통계 분석': 'bg-violet-100 text-violet-700 border-violet-200',
  '법률/제도': 'bg-slate-100 text-slate-700 border-slate-200',
  '건강한 게임': 'bg-lime-100 text-lime-700 border-lime-200',
}

const categories = ['전체', ...Object.keys(categoryColors)]

export default function BlogClient() {
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredPosts = selectedCategory === '전체'
    ? blogPosts
    : blogPosts.filter((post) => post.category === selectedCategory)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '블로그', item: 'https://lotto45.kr/blog' },
    ],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">블로그</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">로또 정보 블로그</h1>
        <div className="mb-6 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
            Lotto45 블로그에서는 로또 6/45와 연금복권 720+에 관한 <strong>확률 분석, 세금 정보, 당첨 전략, 법률 상식</strong> 등
            복권에 대해 알아야 할 모든 정보를 깊이 있게 다룹니다.
          </p>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
            수학적 확률 이론부터 실제 당첨자들의 수령 절차, 세금 계산 방법, 건강한 게임 문화까지 —
            단순한 번호 추천을 넘어 복권에 대한 올바른 이해를 돕는 것이 이 블로그의 목표입니다.
            모든 글은 공식 데이터와 관련 법령을 기반으로 작성되며, 정기적으로 업데이트됩니다.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>총 <strong className="text-gray-700">{blogPosts.length}개</strong>의 글</span>
            <span>|</span>
            <span>카테고리: 당첨 가이드, 확률 분석, 세금/재무, 법률/제도, 통계 분석 등</span>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            const colorClass = cat === '전체'
              ? (isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-600 border-gray-200')
              : (isActive ? (categoryColors[cat] || 'bg-gray-100 text-gray-600 border-gray-200') : 'bg-gray-100 text-gray-600 border-gray-200')
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${colorClass} hover:opacity-80`}
              >
                {cat}
                {cat !== '전체' && (
                  <span className="ml-1 opacity-60">
                    ({blogPosts.filter((p) => p.category === cat).length})
                  </span>
                )}
                {cat === '전체' && (
                  <span className="ml-1 opacity-60">({blogPosts.length})</span>
                )}
              </button>
            )
          })}
        </div>

        {/* 블로그 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {filteredPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-indigo-300 p-5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[post.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.date}</span>
                <span className="text-xs text-gray-500 ml-auto">{post.readTime}분 읽기</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {post.description}
              </p>
              <div className="mt-3 flex items-center text-xs text-indigo-600 group-hover:text-indigo-500 transition-colors">
                <span>자세히 읽기</span>
                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">해당 카테고리에 글이 없습니다.</p>
          </div>
        )}

        {/* CTA */}
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">AI 분석으로 이번 주 번호를 추천받으세요</h2>
          <p className="text-sm text-gray-500 mb-4">CDM + Markov + Monte Carlo 앙상블 분석 결과를 무료로 확인하세요.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            무료 번호 추천 받기
          </a>
        </div>
      </div>
    </div>
  )
}