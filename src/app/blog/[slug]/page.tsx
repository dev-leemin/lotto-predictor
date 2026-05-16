import { blogPosts } from '@/data/blog-posts'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://lotto45.kr/blog/${post.slug}` },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  // 같은 카테고리 우선, 이후 다른 카테고리에서 보충
  const sameCategory = blogPosts.filter((p) => p.slug !== slug && p.category === post.category)
  const otherCategory = blogPosts.filter((p) => p.slug !== slug && p.category !== post.category)
  const relatedPosts = [...sameCategory, ...otherCategory].slice(0, 3)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: { '@type': 'Organization', name: 'Lotto45' },
    publisher: { '@type': 'Organization', name: 'Lotto45' },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `https://lotto45.kr/blog/${post.slug}`,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://lotto45.kr' },
      { '@type': 'ListItem', position: 2, name: '블로그', item: 'https://lotto45.kr/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://lotto45.kr/blog/${post.slug}` },
    ],
  }

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

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-indigo-600">홈</a>
          <span className="mx-2">/</span>
          <a href="/blog" className="hover:text-indigo-600">블로그</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 line-clamp-1">{post.title}</span>
        </nav>

        {/* 아티클 헤더 */}
        <article>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[post.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {post.category}
              </span>
              <span className="text-xs text-gray-500">{post.date}</span>
              <span className="text-xs text-gray-500">{post.readTime}분 읽기</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">{post.description}</p>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 mb-8" />

          {/* 아티클 본문 */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* 관련 글 */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">관련 글</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedPosts.map((related) => (
                <a
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block bg-white border border-gray-200 rounded-xl shadow-sm hover:border-indigo-300 p-4 transition-all duration-300"
                >
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[related.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {related.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-xs text-gray-500">{related.date} / {related.readTime}분 읽기</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/blog"
            className="inline-block px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold text-center transition-all"
          >
            블로그 목록으로
          </a>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-bold text-center transition-all"
          >
            무료 번호 추천 받기
          </a>
        </div>
      </div>

      {/* blog-content 스타일링 (prose-like, Tailwind 유틸리티 클래스 기반) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1F2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content p {
          font-size: 0.875rem;
          color: #4B5563;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .blog-content ul {
          list-style-type: disc;
          list-style-position: inside;
          font-size: 0.875rem;
          color: #4B5563;
          margin-bottom: 1rem;
        }
        .blog-content ul li {
          margin-bottom: 0.25rem;
          line-height: 1.75;
        }
        .blog-content ol {
          list-style-type: decimal;
          list-style-position: inside;
          font-size: 0.875rem;
          color: #4B5563;
          margin-bottom: 1rem;
        }
        .blog-content ol li {
          margin-bottom: 0.25rem;
          line-height: 1.75;
        }
        .blog-content strong {
          color: #4F46E5;
        }
      `}} />
    </div>
  )
}