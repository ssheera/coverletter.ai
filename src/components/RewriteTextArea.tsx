import React from 'react'
import {ConditionalValue, Flex, HStack, Text, Textarea} from '@chakra-ui/react'
import {TbSparkles} from 'react-icons/tb'
import {Button} from '@/components/ui/button'
import {createAxios} from '@/lib/axios'
import {Skeleton} from '@/components/ui/skeleton'

type GenerateTextAreaProps = {
    placeholder: string
    minHeight: string
    resize: string
    variant: ConditionalValue<'outline' | 'subtle' | 'flushed' | undefined>
    value: string
    llm: string
    jobDescription: string
    onGenerate: (response: string) => void
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function RewriteTextArea (props: GenerateTextAreaProps) {

    const prompt =
        `
        Rewrite the given experience description to tailor it to the specified job description, as a technical HR manager would. You should emphasize skills and experiences relevant to the job, even if the original description is not directly applicable.
        
        # Steps
        
        1. **Understanding the Context**:
           - Review the set of text to understand the specific job description and requirements.
           - Analyze the user-provided experience description to identify core skills and achievements.
        
        2. **Customization**:
           - Identify key skills and responsibilities from the job description.
           - Highlight relevant skills or experiences in the user's description and reword them to align with the job role.
        
        3. **Integration**:
           - Adjust any unrelated aspects so they align or can be associated with the job's skills and requirements. Do not start reasoning, just action words and phrases.
           - Ensure the language and tone are professional and HR-oriented.
        
        4. **Formatting**:
           - Rewrite each point of the experience description.
           - Each line must start on a new line with no gaps between them.
        
        # Output Format
        
        - The output must be rewritten in a series of lines, with each point on a new line and no gaps in between. Do not add any dashes, bullets, or numbering.
        - Use clear, concise language that emphasizes alignment with the job description.
        
        # Examples
        
        **Input**:
        - Job description set: [Insert brief summary of job requirements here]
        - Experience Description: 'Developed a project management application using Java, collaborated with different departments, improved workflow efficiency.'
        
        **Rewritten Output**:
        - Leveraged Java programming skills to develop a project management application, aligning with the data-driven focus of [Job Company's Name].
        - Collaborated cross-functionally to enhance workflow efficiency, directly supporting [specific job role] team dynamics.
        - Spearheaded improvements that reflect the innovation-driven values of [Job Company's Name].
        
        (Real examples should be more detailed and contextually adapted to the specific job and experience descriptions.)
        
        # Notes
        
        - Focus on making connections between existing experiences and the desired job role, even if they require creative linking.
        - Maintain a professional tone throughout to reflect HR standards and the company's values.
        `

    const [originalValue, setOriginalValue] = React.useState('')
    const [generating, setGenerating] = React.useState(false)

    const axios = createAxios()

    const { value, onGenerate, llm, jobDescription } = props

    const handleGenerate = async () => {
        setGenerating(true)
        setOriginalValue(value)
        try {
            const response = await axios.post('/api/tasks/rewrite', {
                input: 'Text: ' + value + '\n\nJob Description: ' + jobDescription,
                prompt: prompt,
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
                <Button disabled={jobDescription === ''} loading={generating} variant='subtle' size='2xs' onClick={handleGenerate}>
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