import { NextApiRequest, NextApiResponse } from 'next'
import {processResumeData} from '@/lib/llm'
import PQueue from 'p-queue'
import os from 'os'
import { getSession } from '@/lib/session'
import {ResumeData} from '@/interfaces/ResumeData'
import {prisma} from "@/lib/prisma";

const llmQueue = new PQueue({ concurrency: os.cpus().length })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const session = await getSession(req, res)

    if (!session.user) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.users.findFirst({
        where: { id: session.user },
        cacheStrategy: { ttl: 60 }
    })

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const { data, llm } = req.body

        const rData = data as ResumeData

        llmQueue.add(() => processResumeData(rData, llm))
            .then(response => {
                res.status(201).json({ response })
            })
            .catch(error => {
                console.error('Error processing text:', error)
                res.status(500).json({ message: 'An error occurred' })
            })

    } catch (error) {
        console.error('Error processing text:', error)
        return res.status(500).json({ message: 'An error occurred' })
    }
}
