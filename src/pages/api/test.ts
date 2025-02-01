import { NextApiRequest, NextApiResponse } from 'next'
import {parseForm} from '@/lib/forms'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, message: 'Method not allowed' })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fields, files } = await parseForm(req)

    if (!files['blob']) {
        return res.status(400).json({ status: false, message: 'No file uploaded' })
    }

    const link = files['blob'][0].toJSON().filepath

    fs.unlinkSync('C:\\Users\\sande\\Desktop\\Projects\\Personal\\coverletter.ai\\public\\resume.docx')
    fs.writeFileSync('C:\\Users\\sande\\Desktop\\Projects\\Personal\\coverletter.ai\\public\\resume.docx', fs.readFileSync(link))

    return res.status(200).json({ status: true, message: 'File uploaded', link })
}

export const config = {
    api: {
        bodyParser: false,
    }
}
