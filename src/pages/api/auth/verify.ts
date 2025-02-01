import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'
import { pool } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getSession(req, res)

    if (!session.user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [session.user])

    if (rows.length === 0) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    return res.status(200).json({ user: rows[0] })
}