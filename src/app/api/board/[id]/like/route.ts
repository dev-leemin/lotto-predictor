import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { visitorId } = body

    if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 64) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const existingLike = await prisma.postLike.findUnique({
      where: { postId_visitorId: { postId, visitorId } },
    })

    if (existingLike) {
      await prisma.$transaction([
        prisma.postLike.delete({ where: { id: existingLike.id } }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ])
      return NextResponse.json({ liked: false, likesCount: post.likesCount - 1 })
    } else {
      await prisma.$transaction([
        prisma.postLike.create({ data: { postId, visitorId } }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        }),
      ])
      return NextResponse.json({ liked: true, likesCount: post.likesCount + 1 })
    }
  } catch (error) {
    console.error('Like toggle error:', error)
    return NextResponse.json({ error: '좋아요 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
