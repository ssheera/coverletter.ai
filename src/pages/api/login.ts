import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { scanDatabase } from "@/util/dynamo";
import { User } from "@/interfaces/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    try {

        const record = await scanDatabase(record => {
            if (record.email === email)
                return record
        })

        if (!record) {
            return res.status(409).json({ message: 'Invalid email or password' })
        }

        const user = record as User

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(409).json({ message: 'Invalid email or password' })
        }

        const token = user.token
        return res.status(200).json({ token })

    } catch (error) {
        console.error('Error registering user:', error)
        return res.status(500).json({ message: 'Error logging in' })
    }
}
