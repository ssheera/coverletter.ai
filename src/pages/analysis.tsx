import {
    Box,
    Container, Flex,
    Grid, GridItem,
    Heading,
    Text,
    Textarea, useBreakpointValue,
    useDisclosure,
} from '@chakra-ui/react'
import { Toaster, toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import React, {useEffect, useState} from 'react'
import { CoverLetter } from '@/interfaces/CoverLetter'
import { createAxios } from '@/util/axios'
import { FileUploadDropzone, FileUploadList, FileUploadRoot } from '@/components/ui/file-button'
import { FileChangeDetails} from '@zag-js/file-upload'
import CoverLetterDialog from "@/components/CoverLetterDialog";


export default function AnalysisPage() {
    const { open, onOpen, onClose } = useDisclosure()
    const [resume, setResume] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState('')
    const [prompt, setPrompt] = useState('')
    const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const gridTemplate = useBreakpointValue({ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' })

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

            <Grid
                templateColumns={gridTemplate}
                gap='8'>

                <GridItem
                    flex={1}
                    p={6}
                    shadow='lg'
                >
                    <Heading size='lg'  mb={4}>
                        Resume
                    </Heading>
                    <Text fontSize='sm' color='gray' mb={4}>
                        Upload your resume to generate a cover letter
                        but make sure it is in PDF format
                    </Text>

                    <FileUploadRoot
                                    onFileChange={handleResumeChange}
                                    maxW='xl' alignItems='stretch'
                                    accept={['application/pdf']}>
                        <FileUploadDropzone
                            label='Drag and drop here to upload'
                            description='.pdf'
                        />
                        <FileUploadList showSize clearable />
                    </FileUploadRoot>
                </GridItem>

                <GridItem
                    flex={1}
                    p={6}
                    shadow='lg'
                    rowSpan={2}
                    display="flex"
                    flexDirection="column"
                >
                    <Heading size='lg' mb={4}>
                        Job Description
                    </Heading>
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
                        minHeight='400px'
                        mb={4}
                        flex={1}
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

                <GridItem
                    flex={1}
                    p={6}
                    shadow='lg'
                >
                    <Heading size='lg' mb={4}>
                        AI Prompt
                    </Heading>
                    <Text fontSize='sm' color='gray' mb={4}>
                        Enter in a custom prompt if you wish, this will be used instead of the preset prompt
                    </Text>
                    <Textarea
                        resize='none'
                        fontSize='sm'
                        value={prompt}
                        onChange={handlePromptChange}
                        placeholder='Enter a custom prompt here'
                        size='lg'
                        mb={4}
                        h='200px'
                    />
                </GridItem>

            </Grid>


            { coverLetter && open && (
                <CoverLetterDialog data={coverLetter} open={open} onClose={onClose} />
            )}

        </Container>
    )
}
