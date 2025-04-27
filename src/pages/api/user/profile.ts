import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'
import {prisma} from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
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
            data: true
        },
        cacheStrategy: { ttl: 60 }
    })

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    const { data, request } = req.body

    if (!request) {
        return res.status(400).json({ message: 'Bad request' })
    }

    switch (request) {
        case 'save': {
            if (!data)
                return res.status(400).json({ message: 'Bad request' })
            await prisma.users.update({
                where: { id: user.id },
                data: { data: data }
            })
            break
        }
        case 'load': {
            return res.status(200).json({ data: user.data })
        }
    }

    return res.status(200).json({ status: true, message: 'success' })
}
