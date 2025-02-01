import nextSession  from 'next-session'
import { promisifyStore } from 'next-session/lib/compat'
import { IncomingMessage, ServerResponse } from 'node:http'
import pgSession  from 'connect-pg-simple'
import session from 'express-session'
import { pool } from '@/lib/database'

const PgStore = pgSession(session)
const store = new PgStore({
    pool: pool,
    tableName: 'sessions',
})

export async function getSession(req: IncomingMessage, res: ServerResponse) {
    return nextSession({
        store: promisifyStore(store),
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, secure: process.env.NODE_ENV === 'production' },
    })(req, res)
}