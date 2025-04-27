import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/session'
import {prisma} from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email
            }
        })

        if (!user) {
            return res.status(409).json({ message: 'Invalid email or password' })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(409).json({ message: 'Invalid email or password' })
        }

        const session = await getSession(req, res)
        session.user = user.id
        await session.commit()

        return res.status(200).json({ status: 'success' })

    } catch (error) {
        console.error('Error logging in:', error)
        return res.status(500).json({ message: 'Error logging in' })
    }
}
