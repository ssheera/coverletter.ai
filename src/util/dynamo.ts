import {DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { User } from "@/interfaces/User";
import { nanoid } from "nanoid";

const client = new DynamoDBClient({ region: process.env.AWS_REGION })
export const dynamo = DynamoDBDocumentClient.from(client)
interface Callback {
    (record: Record<string, unknown>): unknown
}

export async function scanDatabase(callback: Callback) {

    const cmdScan = new ScanCommand({
        TableName: process.env.AWS_DYNAMODB_USERS_TABLE,
        ProjectionExpression: 'uid, #token, email, password, coverLetters',
        ExpressionAttributeNames: {
            '#token': 'token',
        }
    })

    const data = await dynamo.send(cmdScan)

    if (!data.Items) return null

    for (const record of data.Items) {
        const value = callback(record)
        if (value) return value
    }

    return null
}

export async function updateUser(user: User) {

    const cmdUpdate = new UpdateCommand({
        TableName: process.env.AWS_DYNAMODB_USERS_TABLE,
        Key: { uid: user.uid },
        UpdateExpression: 'SET email = :email, password = :password, #token = :token, coverLetters = :coverLetters',
        ExpressionAttributeNames: {
            '#token': 'token'
        },
        ExpressionAttributeValues: {
            ':email': user.email,
            ':password': user.password,
            ':token': user.token,
            ':coverLetters': user.coverLetters
        }
    })

    await dynamo.send(cmdUpdate)

}

export async function createUser(email: string, password: string) {
    const cmdPut = new PutCommand({
        TableName: process.env.AWS_DYNAMODB_USERS_TABLE,
        Item: {
            uid: await generateUniqueId(),
            email: email,
            password: password,
            token: await generateToken(),
            coverLetters: []
        },
    })

    await dynamo.send(cmdPut)
}

const generateToken = async () => {
    const token = nanoid(128)
    while (true) {
        const exists = await scanDatabase(record => {
            if (record.token === token)
                return true
        })
        if (!exists)
            return token
    }
}

const generateUniqueId = async () => {
    const uid = nanoid()
    while (true) {
        const exists = await scanDatabase(record => {
            if (record.uid === uid)
                return true
        })
        if (!exists)
            return uid
    }
}
