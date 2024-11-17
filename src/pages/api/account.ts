import { NextApiRequest, NextApiResponse } from 'next'
import { scanDatabase } from "@/util/dynamo";
import { User } from "@/interfaces/User";
import { getUserGraph } from "@/util/amplify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, message: 'Method not allowed' })
    }

    const { token } = req.body

    if (!token) {
        return res.status(400).json({ message: 'Unauthorised' })
    }

    try {

        const record = await scanDatabase(record => {
            if (record.token === token)
                return record
        })

        if (!record) {
            return res.status(400).json({ message: 'Unauthorised' })
        }

        const user = record as User
        const uid = user.uid

        const result = await getUserGraph(uid)

        return res.status(200).json({ user: result.data.getUser })
    } catch (error) {
        console.error('Error finding user:', error)
        return res.status(500).json({ message: 'Error finding user' })
    }
}
