import { Pool } from 'pg'

export const pool = new Pool({
    host: process.env.RDS_ENDPOINT,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
})