import {NextApiRequest, NextApiResponse} from 'next'
import {parseForm} from '@/util/forms'
import {scanDatabase} from '@/util/dynamo'
import {processResume} from '@/util/llm'
import fs from 'fs'
import {User} from '@/interfaces/User'
import PQueue from 'p-queue'
import os from 'os'

const resumeQueue = new PQueue({ concurrency: os.cpus().length })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {

        const { fields, files } = await parseForm(req)

        if (!fields || !fields.token || !fields.description || !fields.llm) {
            return res.status(400).json({ message: 'Unauthorised' })
        }

        const token = fields.token[0] as string
        const description = fields.description[0] as string
        const llm = fields.llm ? fields.llm[0] as string : ''
        const prompt = fields.prompt ? fields.prompt[0] as string : ''

        if (!files.file || files.file.length !== 1) {
            return res.status(400).json({ message: 'Missing resume to upload' })
        }

        const record = await scanDatabase(record => {
            if (record.token === token)
                return record
        })

        if (!record) {
            return res.status(400).json({ message: 'Unauthorised' })
        }

        const resume = files.file[0]
        let filePath = resume.filepath

        if (!filePath.endsWith('.pdf')) {
            const newFilePath = `${filePath}.pdf`
            fs.renameSync(filePath, newFilePath)
            filePath = newFilePath
        }

        const user = record as User

        resumeQueue.add(() => processResume(user, filePath, description, prompt, llm))
            .then(response => {
                res.status(201).json({ response })
            })
            .catch(error => {
                console.error('Error processing resume:', error)
                res.status(500).json({ message: 'An error occurred' })
            })

    } catch (error) {
        console.error('Error uploading file:', error)
        return res.status(500).json({ message: 'An error occurred' })
    }
}

export const config = {
    api: {
        bodyParser: false,
    }
}