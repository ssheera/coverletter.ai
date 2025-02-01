import { CoverLetter } from '@/interfaces/CoverLetter'

export interface User {
    id: number,
    email: string,
    password: string,
    data: string
}

export type ClientUser = Omit<Omit<User, 'password'>, 'data'>

// User but with more fields
export type AccountUser = ClientUser & {
    coverLetters: CoverLetter[]
}