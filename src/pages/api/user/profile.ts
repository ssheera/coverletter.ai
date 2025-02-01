import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'
import { pool } from '@/lib/database'
import { User } from '@/interfaces/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, message: 'Method not allowed' })
    }

    const session = await getSession(req, res)

    if (!session.user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const { rows } = await pool.query<User>('SELECT * FROM users WHERE id = $1', [session.user])

    if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' })
    }

    const user = rows[0]

    const { data, request } = req.body

    if (!request) {
        return res.status(400).json({ message: 'Bad request' })
    }

    switch (request) {
        case 'save': {
            if (!data)
                return res.status(400).json({ message: 'Bad request' })
            await pool.query('UPDATE users SET data = $1 WHERE id = $2', [data, user.id])
            break
        }
        case 'load': {
            return res.status(200).json({ data: user.data })
        }
    }

    return res.status(200).json({ status: true, message: 'success' })

}