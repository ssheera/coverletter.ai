import nextSession  from 'next-session'
import { promisifyStore } from 'next-session/lib/compat'
import { IncomingMessage, ServerResponse } from 'node:http'
import session from 'express-session'
import {prisma} from "@/lib/prisma"

class PrismaSessionStore extends session.Store {

    // @ts-expect-error: ignore
    async get(sid, callback) {
        try {
            const session = await prisma.sessions.findUnique({
                where: { sid: sid },
                select: { sess: true }
            })
            if (!session) return callback(null, null)
            callback(null, session.sess)
        } catch (err) {
            callback(err)
        }
    }

    // @ts-expect-error: ignore
    async set(sid, sess, callback) {
        try {
            await prisma.sessions.upsert({
                where: { sid: sid },
                update: { sess: sess, expire: sess.cookie.expires },
                create: { sid: sid, sess: sess, expire: sess.cookie.expires },
            })
            callback(null)
        } catch (err) {
            callback(err)
        }
    }

    // @ts-expect-error: ignore
    async destroy(sid, callback) {
        try {
            await prisma.sessions.delete({
                where: { sid: sid },
            })
            callback(null)
        } catch (err) {
            callback(err)
        }
    }
}

export async function getSession(req: IncomingMessage, res: ServerResponse) {
    return nextSession({
        store: promisifyStore(new PrismaSessionStore()),
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production' },
    })(req, res)
}