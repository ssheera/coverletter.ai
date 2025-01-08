import OpenAI from 'openai'
import { CoverLetter } from '@/interfaces/CoverLetter'
import fs from 'fs'
import { User } from '@/interfaces/User'
import { updateUser } from '@/util/dynamo'
import {getSignedUrlForFile} from "@/util/bucket";

export const openai = new OpenAI()

export const processResume = async (user: User, resumePath: string, description: string, customPrompt: string) => {

    const presetURL = await getSignedUrlForFile('prompt.txt')
    const presetPrompt = await fetch(presetURL).then(res => res.text())

    let prompt = 'I DON\'T NEED ANY CITATIONS\n'

    if (customPrompt) {
        prompt += customPrompt + '\n'
    } else {
        prompt += presetPrompt + '\n'
    }

    prompt += '\n' +
        'Response format must be RAW JSON SCHEMA,\n' +
        'Do not use MARKDOWN or ``` code blocks!\n' +
        '    \n' +
        '{\n' +
        '    "name": "result",\n' +
        '    "strict": true,\n' +
        '    "schema": {\n' +
        '        "type": "object",\n' +
        '        "properties": {\n' +
        '            "company": {\n' +
        '                "type": "string",\n' +
        '                "description": "The name of the company that is addressed."\n' +
        '            },\n' +
        '            "job": {\n' +
        '                "type": "string",\n' +
        '                "description": "The job title for the position being applied for."\n' +
        '            },\n' +
        '            "content": {\n' +
        '                "type": "string",\n' +
        '                "description": "The content of the answer\n' +
        '            }\n' +
        '        },\n' +
        '        "required": [\n' +
        '            "company",\n' +
        '            "job",\n' +
        '            "content"\n' +
        '        ],\n' +
        '        "additionalProperties": false\n' +
        '    }\n' +
        '}'

    const [assistant, resumeFile] = await Promise.all([
        openai.beta.assistants.create({
            name: 'Assistant',
            instructions: prompt,
            model: 'gpt-4o-mini',
            tools: [{ type: 'file_search' }],
            temperature: 0.8,

        }),
        openai.files.create({ file: fs.createReadStream(resumePath), purpose: 'assistants' })
    ])

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
    })

    const messages = await openai.beta.threads.messages.list(thread.id, {
        run_id: run.id,
    })

    const message = messages.data.pop()!

    const content = message.content[0]

    await Promise.all([
        openai.files.del(resumeFile.id),
        openai.beta.assistants.del(assistant.id),
        openai.beta.threads.del(thread.id)
    ])

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