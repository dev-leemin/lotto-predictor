import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizeInput } from '@/lib/board-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

const VALID_CATEGORIES = ['FREE', 'SHARE', 'WINNING'] as const
const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const sort = searchParams.get('sort') || 'latest'

    const where: Record<string, unknown> = {}
    if (category && VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
      where.category = category
    }

    let orderBy: Record<string, string>
    switch (sort) {
      case 'popular':
        orderBy = { likesCount: 'desc' }
        break
      case 'views':
        orderBy = { views: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          category: true,
          title: true,
          nickname: true,
          views: true,
          likesCount: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts: posts.map(p => ({
        id: p.id,
        category: p.category,
        title: p.title,
        nickname: p.nickname,
        views: p.views,
        likesCount: p.likesCount,
        createdAt: p.createdAt.toISOString(),
        commentCount: p._count.comments,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })
  } catch (error) {
    console.error('Board list error:', error)
    return NextResponse.json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`post:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
    }

    const body = await request.json()
    const { category, title, content, nickname, password } = body

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: '카테고리를 선택해주세요.' }, { status: 400 })
    }
    if (!title?.trim() || title.trim().length > 100) {
      return NextResponse.json({ error: '제목은 1~100자로 입력해주세요.' }, { status: 400 })
    }
    if (!content?.trim() || content.trim().length > 10000) {
      return NextResponse.json({ error: '내용은 1~10000자로 입력해주세요.' }, { status: 400 })
    }
    if (!nickname?.trim() || nickname.trim().length > 20) {
      return NextResponse.json({ error: '닉네임은 1~20자로 입력해주세요.' }, { status: 400 })
    }
    if (!password || password.length < 4 || password.length > 20) {
      return NextResponse.json({ error: '비밀번호는 4~20자로 입력해주세요.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const post = await prisma.post.create({
      data: {
        category,
        title: sanitizeInput(title.trim()),
        content: sanitizeInput(content.trim()),
        nickname: sanitizeInput(nickname.trim()),
        passwordHash,
      },
    })

    return NextResponse.json({ id: post.id }, { status: 201 })
  } catch (error) {
    console.error('Board create error:', error)
    return NextResponse.json({ error: '게시글 작성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
