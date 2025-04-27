import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'
import {prisma} from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        return res.status(405).json({ status: false, message: 'Method not allowed' })
    }

    const session = await getSession(req, res)

    if (!session.user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.users.findUnique({
        where: { id: session.user },
        select: {
            id: true,
            email: true,
            coverletters: true
        },
        cacheStrategy: { ttl: 30 }
    })

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({
        id: user.id,
        email: user.email,
        coverLetters: user.coverletters,
    });
}
