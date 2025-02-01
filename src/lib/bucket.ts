import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'

export const s3client = new S3Client({region: process.env.AWS_REGION})

export const uploadFile = async (key: string, path: string) => {

    const body = fs.readFileSync(path)

    const cmdPut = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME, Key: key, Body: body
    })
    const cmdGet = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME, Key: key
    })

    try {
        await s3client.send(cmdPut)
        return await getSignedUrl(s3client, cmdGet, { expiresIn: 3600 })
    } catch (error) {
        throw new Error(`Error uploading file: ${error}`)
    }

}

export const getSignedUrlForFile = async (key: string) => {

    const cmdGet = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME, Key: key
    })

    try {
        return await getSignedUrl(s3client, cmdGet, { expiresIn: 3600 })
    } catch (error) {
        throw new Error(`Error getting signed URL: ${error}`)
    }

}