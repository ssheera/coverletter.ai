import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/session'
import { pool } from '@/lib/database'
import {AccountUser, ClientUser} from '@/interfaces/User'
import {CoverLetter} from '@/interfaces/CoverLetter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        return res.status(405).json({ status: false, message: 'Method not allowed' })
    }

    const session = await getSession(req, res)

    if (!session.user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const [{ rows: rows }, { rows: coverLetters }] = await Promise.all([
        pool.query<ClientUser>('SELECT id, email FROM users WHERE id = $1', [session.user]),
        pool.query<CoverLetter>('SELECT date, company, job_title, contents FROM coverletters WHERE user_fk = $1', [session.user])
    ])

    if (rows.length === 0) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    return res.status(200).json({
        id: rows[0].id,
        email: rows[0].email,
        coverLetters: coverLetters
    } as AccountUser)

}
