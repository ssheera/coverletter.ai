import {
    Container, createListCollection, Flex,
    GridItem, Group,
    Heading,
    Text,
    Textarea, useDisclosure,
} from '@chakra-ui/react'
import { Toaster, toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import React, {useEffect, useState} from 'react'
import { CoverLetter } from '@/interfaces/CoverLetter'
import { createAxios } from '@/util/axios'
import { FileUploadDropzone, FileUploadList, FileUploadRoot } from '@/components/ui/file-button'
import { FileChangeDetails } from '@zag-js/file-upload'
import CoverLetterDialog from '@/components/CoverLetterDialog'
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText
} from '@/components/ui/select'
import {
    StepsContent,
    StepsNextTrigger,
    StepsRoot,
    StepsPrevTrigger
} from '@/components/ui/steps'

export default function AnalysisPage() {
    const { open, onOpen, onClose } = useDisclosure()
    const [resume, setResume] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState('')
    const [prompt, setPrompt] = useState('')
    const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [llm, setLLM] = useState('Gemini')
    const [step, setStep] = useState(0)

    const apis = createListCollection({
        items: ['OpenAI', 'Gemini'],
    })

    const axios = createAxios()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) location.href = '/login'
    }, [])

    const handleResumeChange = (details: FileChangeDetails) => {
        if (details.acceptedFiles) {
            const file = details.acceptedFiles[0]
            if (file) {
                const reader = new FileReader()
                reader.onloadend = async () => {
                    setResume(file)
                }
                reader.readAsDataURL(file)
                return
            }
        }
        setResume(null)
    }

    const handleJobDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJobDescription(event.target.value)
    }

    const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(event.target.value)
    }

    const generateCoverLetter = async () => {
        if (!resume || !jobDescription) return
        try {
            setIsProcessing(true)
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('token', token as string)
            formData.append('file', resume, 'resume')
            formData.append('description', jobDescription)
            formData.append('llm', llm)
            if (prompt) {
                formData.append('prompt', prompt)
            }
            const res = await axios.post('/api/process', formData)
            if (res.status == 201) {
                setCoverLetter(res.data.response)
                toaster.create({
                    title: 'Success',
                    description: 'Your cover letter has been generated successfully',
                    type: 'success',
                    duration: 3000,
                })
                onOpen()
            } else {
                toaster.error({
                    title: 'Failed',
                    description: res.data.message,
                    type: 'error',
                    duration: 3000,
                })
            }
        } catch (error) {
            toaster.error({
                title: 'Failed',
                type: 'error',
                duration: 3000,
            })
            console.error('An error occurred:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Container maxW='7xl' py={20}>
            <Toaster/>

            <Flex justify='center'>
                <StepsRoot step={step} variant='subtle' onStepChange={(e) => setStep(e.step)} count={3}>

                    <Group mt={6}>
                        <StepsPrevTrigger asChild>
                            <Button variant='outline' size='sm' disabled={step === 0}>
                                Prev
                            </Button>
                        </StepsPrevTrigger>
                        <StepsNextTrigger asChild>
                            <Button variant='outline' size='sm' disabled={step === 2}>
                                Next
                            </Button>
                        </StepsNextTrigger>
                    </Group>

                    <StepsContent index={0}>
                        <GridItem p={6} shadow='lg'>
                            <Heading size='lg' mb={4}>Resume</Heading>
                            <Text fontSize='sm' color='gray' mb={4}>
                                Upload your resume to generate a cover letter in PDF format
                            </Text>
                            <FileUploadRoot
                                onFileChange={handleResumeChange}
                                accept={['application/pdf']}
                            >
                                <FileUploadDropzone
                                    label='Drag and drop here to upload'
                                    description='.pdf'
                                    width='100%'
                                />
                                <FileUploadList showSize clearable />
                            </FileUploadRoot>
                        </GridItem>
                    </StepsContent>

                    <StepsContent index={1}>
                        <GridItem p={6} shadow='lg'>
                            <Heading size='lg' mb={4}>AI Settings</Heading>
                            <Text fontSize='sm' color='gray' mb={4}>
                                Enter a custom prompt if you want to customize the generation process
                            </Text>
                            <Textarea
                                resize='none'
                                fontSize='sm'
                                value={prompt}
                                onChange={handlePromptChange}
                                placeholder='Enter a custom prompt here'
                                size='lg'
                                h='200px'
                                mb={4}
                            />
                            <Text fontSize='sm' color='gray' mb={4}>
                                Select the language model to use for the generation process
                            </Text>
                            <SelectRoot
                                value={[llm]}
                                onValueChange={({ value }) => setLLM(value[0])}
                                collection={apis}
                                mb={4}
                            >
                                <SelectTrigger>
                                    <SelectValueText />
                                </SelectTrigger>
                                <SelectContent>
                                    {apis.items.map((api) => (
                                        <SelectItem item={api} key={api}>{api}</SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </GridItem>
                    </StepsContent>

                    <StepsContent index={2} >
                        <GridItem p={6} shadow='lg'>
                            <Heading size='lg' mb={4}>Job Description</Heading>
                            <Text fontSize='sm' color='gray' mb={4}>
                                Paste the job description here to generate a cover letter
                            </Text>
                            <Textarea
                                resize='none'
                                fontSize='sm'
                                value={jobDescription}
                                onChange={handleJobDescriptionChange}
                                placeholder='Paste the job description here'
                                size='lg'
                                minHeight='300px'
                                mb={4}
                            />
                            <Flex>
                                <Button
                                    onClick={generateCoverLetter}
                                    loading={isProcessing}
                                    loadingText='Processing'
                                    disabled={!resume || !jobDescription}
                                >
                                    Process
                                </Button>
                            </Flex>
                        </GridItem>
                    </StepsContent>

                </StepsRoot>
            </Flex>

            { coverLetter && open && (
                <CoverLetterDialog data={coverLetter} open={open} onClose={onClose} />
            )}

        </Container>
    )
}
