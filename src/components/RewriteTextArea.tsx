import React from 'react'
import {ConditionalValue, Flex, HStack, Text, Textarea, TextareaProps} from '@chakra-ui/react'
import {TbSparkles} from 'react-icons/tb'
import {Button} from '@/components/ui/button'
import {createAxios} from '@/lib/axios'
import {Skeleton} from '@/components/ui/skeleton'

type GenerateTextAreaProps = TextareaProps & {
    value: string
    variant: ConditionalValue<'outline' | 'subtle' | 'flushed' | undefined>
    llm: string
    jobDescription: string
    onGenerate: (response: string) => void
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function RewriteTextArea (props: GenerateTextAreaProps) {

    const [originalValue, setOriginalValue] = React.useState('')
    const [generating, setGenerating] = React.useState(false)

    const axios = createAxios()

    const { value, onGenerate, llm, jobDescription } = props

    const handleGenerate = async () => {
        setGenerating(true)
        setOriginalValue(value)
        try {
            const response = await axios.post('/api/tasks/rewrite', {
                text: value,
                jobDescription: jobDescription,
                llm: llm
            }, { withCredentials: true })
            onGenerate(response.data.response)
        } catch (error) {
            console.error('Error generating text:', error)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <>
            <Flex gap='2'>
                <Button loading={generating} variant='subtle' size='2xs' onClick={handleGenerate}>
                    <HStack gap='2'>
                        <TbSparkles/>
                        <Text>
                            Generate
                        </Text>
                    </HStack>
                </Button>
                <Button hidden={originalValue === ''} disabled={generating} variant='subtle' size='2xs' onClick={() => {
                    onGenerate(originalValue)
                    setOriginalValue('')
                }}>
                    Undo
                </Button>
            </Flex>
            {generating ? (
                <Skeleton height='100%' width='100%'>
                    <Textarea disabled {...props} />
                </Skeleton>
            ) : (
                <Textarea {...props} />
            )}
        </>
    )

}