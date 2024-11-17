import { CoverLetter } from "@/interfaces/CoverLetter";

export interface UserDetails {
    uid: string,
    email: string,
    coverLetters: CoverLetter[]
}
