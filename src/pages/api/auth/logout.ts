import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const session = await getSession(req, res)
    await session.destroy()

    return res.status(200).json({ status: 'success' })
}