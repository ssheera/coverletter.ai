import { NextApiRequest, NextApiResponse } from 'next'
import { parseForm } from '@/lib/forms'
import { processResume } from '@/lib/llm'
import fs from 'fs'
import PQueue from 'p-queue'
import os from 'os'
import { getSession } from '@/lib/session'
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
        select: { id: true },
        cacheStrategy: { ttl: 60 }
    })

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const { fields, files } = await parseForm(req)

        if (!fields || !fields.description || !fields.llm) {
            return res.status(400).json({ message: 'Unauthorised' })
        }

        const description = fields.description[0] as string
        const llm = fields.llm ? fields.llm[0] as string : ''
        const prompt = fields.prompt ? fields.prompt[0] as string : ''
        const addonData = fields.addonData ? fields.addonData[0] as string : ''

        if (!files.file || files.file.length !== 1) {
            return res.status(400).json({ message: 'Missing resume to upload' })
        }

        const resume = files.file[0]
        let filePath = resume.filepath

        if (!filePath.endsWith('.pdf')) {
            const newFilePath = `${filePath}.pdf`
            fs.renameSync(filePath, newFilePath)
            filePath = newFilePath
        }

        llmQueue.add(() => processResume(user.id, filePath, description, prompt, addonData, llm))
            .then(response => {
                res.status(201).json({ response })
            })
            .catch(error => {
                console.error('Error processing resume:', error)
                res.status(500).json({ message: 'An error occurred' })
            })

    } catch (error) {
        console.error('Error processing resume:', error)
        return res.status(500).json({ message: 'An error occurred' })
    }
}

export const config = {
    api: {
        bodyParser: false,
    }
}
