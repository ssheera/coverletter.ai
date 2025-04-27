import {CoverLetter} from '@/interfaces/CoverLetter'
import fs from 'fs'
import {getSignedUrlForFile} from '@/lib/bucket'
import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai'
import {ResumeData} from '@/interfaces/ResumeData'
import {OpenAI} from 'openai'
import {prisma} from "@/lib/prisma";

const OPENAI_MODEL = process.env.OPENAI_MODEL as string || 'gpt-4.1-nano'
const GEMINI_MODEL = process.env.GEMINI_MODEL as string || 'gemini-2.5-flash-preview-04-17'

export const processResume = async (userId: number, resumePath: string, description: string, customPrompt: string, addonData: string, llm: string) => {

    let prompt: string

    if (customPrompt) prompt = customPrompt
    else prompt = (await (async () => {
        const presetURL = await getSignedUrlForFile('uploads/coverLetter_prompt')
        return fetch(presetURL).then((res) => res.text())
    })())

    if (addonData) prompt += `\n${addonData}`

    let coverLetter: CoverLetter | undefined

    switch (llm) {
        case 'Gemini': {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
            const model = genAI.getGenerativeModel({
                model: GEMINI_MODEL,
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
                    job_title: {
                        type: SchemaType.STRING,
                        description: 'The job title for the position being applied for, if any'
                    },
                    contents: {
                        type: SchemaType.STRING,
                        description: 'The content of the answer'
                    }
                },
                required: ['company', 'job_title', 'contents'],
            }
            model.generationConfig.responseMimeType = 'application/json'
            const file = {
                inlineData: {
                    data: Buffer.from(fs.readFileSync(resumePath)).toString('base64'),
                    mimeType: 'application/pdf',
                },
            }
            const response = await model.generateContent([description, file])
            const result = response.response.text()
            if (result.startsWith("ny\n```json")) {
                const jsonResponse = result.slice(10, -3).trim()
                coverLetter = JSON.parse(jsonResponse)
                break
            }
            coverLetter = JSON.parse(result)
            break
        }
        case 'OpenAI': {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            })
    
            const resumeData = fs.readFileSync(resumePath)
            const base64Resume = resumeData.toString('base64')
    
            const messages = [
                { "role": 'system', "content": prompt },
                {
                    "role": 'user',
                    "content": [
                        {
                            "type": "text",
                            "text": description
                        },
                        {
                            "type": "file",
                            "file": {
                              "file_data": `data:application/pdf;base64,${base64Resume}`, 
                              "filename": "Resume.pdf"
                            }
                        }
                    ]   
                }
            ]
    
            const response = await openai.chat.completions.create({
                model: OPENAI_MODEL,
                //@ts-expect-error: temporary fix for OpenAI types
                messages: messages,
                response_format: {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "job_application",
                        "strict": true,
                        "schema": {
                            "type": "object",
                            "properties": {
                            "company": {
                                "type": "string",
                                "description": "The name of the company that is addressed, if any"
                            },
                            "job_title": {
                                "type": "string",
                                "description": "The job title for the position being applied for, if any"
                            },
                            "contents": {
                                "type": "string",
                                "description": "The content of the answer"
                            }
                            },
                            "required": [
                            "company",
                            "job_title",
                            "contents"
                            ],
                            "additionalProperties": false
                        }
                    }
                },
                reasoning_effort: OPENAI_MODEL.startsWith("o") ? 'high' : null,
                store: false
            })
    
            const raw = response.choices[0].message.content
            coverLetter = JSON.parse(raw!)
            break;
        }
    }

    if (!coverLetter) {
        throw new Error('Invalid response')
    }

    const response: CoverLetter = {
        date: new Date().toISOString(),
        company: coverLetter.company ?? 'N/A',
        job_title: coverLetter.job_title ?? 'N/A',
        contents: coverLetter.contents ?? 'N/A'
    }

    await prisma.coverletters.create({
        data: {
            user_fk: userId,
            date: response.date,
            company: response.company,
            job_title: response.job_title,
            contents: response.contents,
        },
    })

    return response
}

export const processText = async (value: string, jobDescription: string, llm: string) => {

    const prompt = (await (async () => {
        const presetURL = await getSignedUrlForFile('uploads/rewrite_prompt')
        return fetch(presetURL).then((res) => res.text())
    })())

    switch (llm) {
        case 'Gemini':
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
            const model = genAI.getGenerativeModel({
                model: GEMINI_MODEL,
                systemInstruction: prompt
            })
            model.generationConfig.temperature = 0.8
            const response = await model.generateContent([value, jobDescription])
            return response.response.text()
    }

    return value
}

export const processResumeData = async (data: ResumeData, llm: string) => {

    const prompt = (await (async () => {
        const presetURL = await getSignedUrlForFile('uploads/resumeData_prompt')
        return fetch(presetURL).then((res) => res.text())
    })())

    switch (llm) {
        case 'Gemini':
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
            const model = genAI.getGenerativeModel({
                model: GEMINI_MODEL,
                systemInstruction: prompt
            })
            model.generationConfig.responseSchema = {
                type: SchemaType.OBJECT,
                properties: {
                    'forename': {
                        type: SchemaType.STRING
                    },
                    'surname': {
                        type: SchemaType.STRING
                    },
                    'profileLinks': {
                        type: SchemaType.ARRAY,
                        'items': {
                            type: SchemaType.OBJECT,
                            'properties': {
                                'profile': {
                                    type: SchemaType.STRING
                                },
                                'descriptor': {
                                    type: SchemaType.STRING
                                },
                                'hyperlink': {
                                    type: SchemaType.STRING
                                }
                            },
                            'required': [
                                'profile',
                                'descriptor',
                                'hyperlink'
                            ]
                        }
                    },
                    'sections': {
                        type: SchemaType.ARRAY,
                        'items': {
                            type: SchemaType.OBJECT,
                            'properties': {
                                'name': {
                                    type: SchemaType.STRING
                                },
                                'items': {
                                    type: SchemaType.ARRAY,
                                    'items': {
                                        type: SchemaType.OBJECT,
                                        'properties': {
                                            'title': {
                                                type: SchemaType.STRING
                                            },
                                            'from': {
                                                type: SchemaType.STRING
                                            },
                                            'to': {
                                                type: SchemaType.STRING
                                            },
                                            'list': {
                                                type: SchemaType.BOOLEAN
                                            },
                                            'description': {
                                                type: SchemaType.STRING
                                            }
                                        },
                                        'required': [
                                            'title',
                                            'from',
                                            'to',
                                            'list',
                                            'description'
                                        ]
                                    }
                                }
                            },
                            'required': [
                                'name',
                                'items'
                            ]
                        }
                    },
                    'skills': {
                        type: SchemaType.ARRAY,
                        'items': {
                            type: SchemaType.OBJECT,
                            'properties': {
                                type: {
                                    type: SchemaType.STRING
                                },
                                'items': {
                                    type: SchemaType.STRING
                                }
                            },
                            'required': [
                                'type',
                                'items'
                            ]
                        }
                    }
                },
                'required': [
                    'forename',
                    'surname',
                    'profileLinks',
                    'sections',
                    'skills'
                ]
            }
            model.generationConfig.responseMimeType = 'application/json'
            const response = await model.generateContent([JSON.stringify(data)])
            const result = response.response.text()
            if (result.startsWith("ny\n```json")) {
                const jsonResponse = result.slice(10, -3).trim()
                return JSON.parse(jsonResponse)
            }
            return JSON.parse(result)
    }

    return data
}
