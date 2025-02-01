export type Experience = {
    title: string
    from: string
    to: string
    list: boolean
    description: string
}

export type Section = {
    name: string
    items: Array<Experience>
}

export type ProfileLink = {
    profile: string
    descriptor: string
    hyperlink?: string
}

export type Skill = {
    type: string
    items: string
}

export type ResumeData = {
    forename: string
    surname: string
    profileLinks: Array<ProfileLink>
    sections: Array<Section>
    skills: Array<Skill>
}
