import type { Metadata } from 'next'
import { blogPosts } from '@/data/blog-posts'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: '로또 당첨 꿀팁 블로그 - 전략, 확률, 세금 총정리',
  description: '로또 당첨 전략부터 세금 계산, 확률 분석까지! 로또에 대해 알고 싶은 모든 정보를 쉽게 정리했습니다. 총 ' + '40' + '편의 전문 분석 글을 무료로 읽어보세요.',
  keywords: ['로또 블로그', '로또 당첨 팁', '로또 전략', '로또 세금', '로또 확률', '로또 정보'],
  alternates: {
    canonical: 'https://lotto45.kr/blog',
  },
}

export default function BlogPage() {
  // Generate a list of all blog post titles for SSR crawlability
  const postTitles = blogPosts.map(p => p.title)

  return (
    <>
      <BlogClient />
      {/* SEO: 서버에서 렌더링되는 블로그 글 목록 (크롤러용) */}
      <div className="sr-only" aria-hidden="false">
        <h2>Lotto45 블로그 전체 글 목록</h2>
        <p>로또 6/45와 연금복권 720+에 관한 확률 분석, 세금 정보, 당첨 전략, 법률 상식 등 복권에 대해 알아야 할 모든 정보를 다루는 블로그입니다.</p>
        <ul>
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <a href={`/blog/${post.slug}`}>{post.title}</a> - {post.description}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
