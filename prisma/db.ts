import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'prisma/config'
import { PrismaClient } from './generated/client.ts'

const pool = new PrismaPg({ connectionString: env('DATABASE_URL') })
export const prisma = new PrismaClient({ adapter: pool }).$extends(withAccelerate())
