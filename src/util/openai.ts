import OpenAI from 'openai'
import { CoverLetter } from '@/interfaces/CoverLetter'
import fs from 'fs'
import { User } from "@/interfaces/User";
import { updateUser } from "@/util/dynamo";

export const openai = new OpenAI()

export const processResume = async (user: User, resumePath: string, description: string) => {

    const assistant = await openai.beta.assistants.create({
        name: 'Cover Letter Assistant',
        instructions: `
                        You will be given a resume file and a job description. Your task is to write a cover letter based on the resume and job description. 

                        The cover letter should be tailored to the job description and should highlight the candidate's skills and experience.
                        
                        I DON'T NEED ANY CITATIONS, IMAGINE HIRING MANAGER WILL READ THE LETTER
                        
                        Follow this structure: 
                        1. Introduction
                        2. Why I am the perfect candidate
                        3. Why this is the perfect role for me
                        4. Why I am the perfect candidate for this role with some context to the role
                        5. Talk about anything the company has done or is doing and why you are interested in it
                        6. Talk about your skills and experience, EMPHASISE on PAST WORK EXPERIENCE
                        7. Closing
                        8. Thank you for considering my application
                        9. Sincerely,
                        10. Your Name
                        
                        You must then reply in JSON format: { "company": [company], "job": [the job title], "content": [the cover letter] }
                        RAW JSON, NO FORMATTING, NO \`\`\`, NO MARKDOWN
                        MAKE SURE IT PARSES CORRECTLY WITH JSON.parse()
                        `,
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
    })

    const resumeFile = await openai.files.create({ file: fs.createReadStream(resumePath), purpose: 'assistants' })

    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: 'user',
                content: description,
                attachments: [{ file_id: resumeFile.id, tools: [{ type: 'file_search' }] }]
            }
        ]
    })

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id, {
        run_id: run.id,
    });

    const message = messages.data.pop()!;
    const content = message.content[0]

    await openai.files.del(resumeFile.id)

    await openai.beta.assistants.del(assistant.id)

    if (content.type !== 'text') {
        throw new Error('Invalid response')
    }

    const coverLetter = JSON.parse(content.text.value)
    const response: CoverLetter = {
        date: Date.now(),
        company: coverLetter.company,
        job: coverLetter.job,
        content: coverLetter.content
    }

    user.coverLetters.push(response)

    await updateUser(user)

    return response
}