import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'
import {prisma} from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getSession(req, res)

    if (!session.user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.users.findUnique({
        where: { id: session.user },
        select: {
            id: true,
            email: true,
        },
        cacheStrategy: { ttl: 60 }
    })

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    return res.status(200).json({ user: user })
}
