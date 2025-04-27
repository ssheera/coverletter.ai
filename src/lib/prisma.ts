import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { withOptimize } from '@prisma/extension-optimize'

export const prisma = new PrismaClient().$extends(withAccelerate()).$extends(
	process.env.OPTIMIZE_API_KEY
		? withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })
		: {},
)