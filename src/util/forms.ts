import { NextApiRequest } from "next";
import { Fields, Files, IncomingForm } from 'formidable'

export const parseForm = async (req: NextApiRequest): Promise<{ fields: Fields, files: Files }> => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm()
        form.parse(req, (err, fields, files) => {
            if (err) console.log(err)
            if (err) reject(err)
            resolve({ fields, files })
        })
    })
}