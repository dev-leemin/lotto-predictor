import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  if (process.env.USE_NEON_ADAPTER === 'true') {
    // Vercel + Neon serverless 환경
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
    return new PrismaClient({ adapter })
  }
  // Docker / 표준 PostgreSQL 환경
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export default prisma
