import { CoverLetter } from "@/interfaces/CoverLetter";

export interface User {
    uid: string,
    email: string,
    password: string,
    token: string,
    coverLetters: CoverLetter[]
}
