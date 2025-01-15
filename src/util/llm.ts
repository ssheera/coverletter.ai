import OpenAI from 'openai'
import {CoverLetter} from '@/interfaces/CoverLetter'
import fs from 'fs'
import {User} from '@/interfaces/User'
import {updateUser} from '@/util/dynamo'
import {getSignedUrlForFile} from "@/util/bucket";
import {GoogleGenerativeAI, SchemaType} from "@google/generative-ai";

export const openai = new OpenAI()

export const processResume = async (user: User, resumePath: string, description: string, customPrompt: string, llm: string) => {

    const presetURL = await getSignedUrlForFile('prompt.txt')
    const presetPrompt = await fetch(presetURL).then(res => res.text())

    let prompt = 'I DON\'T NEED ANY CITATIONS\n'

    if (customPrompt) {
        prompt += customPrompt + '\n'
    } else {
        prompt += presetPrompt + '\n'
    }

    let coverLetter: CoverLetter | undefined

    switch (llm) {
        case 'OpenAI':

            const [assistant, resumeFile] = await Promise.all([
                openai.beta.assistants.create({
                    name: 'Assistant',
                    instructions: prompt,
                    model: 'gpt-4o-mini',
                    temperature: 0.8,
                    tools: [
                        {
                            type: 'file_search'
                        }
                    ],
                    response_format: {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "application_answer",
                            "strict": true,
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "company": {
                                        "type": "string",
                                        "description": "The name of the company that is addressed, if any."
                                    },
                                    "job": {
                                        "type": "string",
                                        "description": "The job title for the position being applied for, if any."
                                    },
                                    "content": {
                                        "type": "string",
                                        "description": "The content of the answer."
                                    }
                                },
                                "required": [
                                    "company",
                                    "job",
                                    "content"
                                ],
                                "additionalProperties": false
                            }
                        }
                    }
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
                console.error('Invalid response:', content)
                throw new Error('Invalid response')
            }

            coverLetter = JSON.parse(content.text.value)
            break
        case 'Gemini':
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: prompt
            })
            model.generationConfig.temperature = 0.8
            model.generationConfig.responseSchema = {
                type: SchemaType.OBJECT,
                properties: {
                    company: {
                        type: SchemaType.STRING,
                        description: 'The name of the company that is addressed, if any'
                    },
                    job: {
                        type: SchemaType.STRING,
                        description: 'The job title for the position being applied for, if any'
                    },
                    content: {
                        type: SchemaType.STRING,
                        description: 'The content of the answer'
                    }
                },
            }
            model.generationConfig.responseMimeType = 'application/json'
            const file = {
                inlineData: {
                    data: Buffer.from(fs.readFileSync(resumePath)).toString("base64"),
                    mimeType: "application/pdf",
                },
            };
            const response = await model.generateContent([description, file]);
            const result = response.response.text()
            console.log(result)
            coverLetter = JSON.parse(result)
    }

    if (!coverLetter) {
        throw new Error('Invalid response')
    }

    const response: CoverLetter = {
        date: Date.now(),
        company: coverLetter.company ?? 'N/A',
        job: coverLetter.job ?? 'N/A',
        content: coverLetter.content ?? 'N/A'
    }

    user.coverLetters.push(response)

    await updateUser(user)

    return response
}