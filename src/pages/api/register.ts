import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { createUser, scanDatabase } from '@/util/dynamo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {

        const record = await scanDatabase(record => {
            if (record.email === email)
                return record
        })

        if (record) {
            return res.status(409).json({ message: 'User already exists' })
        }

        await createUser(email, hashedPassword)

        return res.status(201).json({ message: 'User registered' })
    } catch (error) {
        console.error('Error registering user:', error)
        return res.status(500).json({ message: 'An error occurred' })
    }
}
