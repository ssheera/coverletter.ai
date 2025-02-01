import {CoverLetter} from '@/interfaces/CoverLetter'
import fs from 'fs'
import {getSignedUrlForFile} from '@/lib/bucket'
import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai'
import {pool} from '@/lib/database'
import {ResumeData} from '@/interfaces/ResumeData'

export const processResume = async (userId: number, resumePath: string, description: string, customPrompt: string, llm: string) => {

    let prompt: string

    if (customPrompt) prompt = customPrompt
    else prompt = (await (async () => {
        const presetURL = await getSignedUrlForFile('uploads/coverLetter_prompt')
        return fetch(presetURL).then((res) => res.text())
    })())

    let coverLetter: CoverLetter | undefined

    switch (llm) {
        case 'Gemini':
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
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
            coverLetter = JSON.parse(result)
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

    await pool.query('INSERT INTO coverletters (user_fk, date, company, job_title, contents) VALUES ($1, $2, $3, $4, $5)', [userId, response.date, response.company, response.job_title, response.contents])

    return response
}

export const processText = async (text: string, prompt: string, llm: string) => {

    switch (llm) {
        case 'Gemini':
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: prompt
            })
            model.generationConfig.temperature = 0.8
            const response = await model.generateContent([text])
            return response.response.text()
    }

    return text

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
                model: 'gemini-1.5-pro',
                systemInstruction: prompt
            })
            model.generationConfig.temperature = 0.8
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
            return JSON.parse(result)
    }

    return data
}
