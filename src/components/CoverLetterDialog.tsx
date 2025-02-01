import React from 'react'
import {Box, IconButton, Text, useBreakpointValue} from '@chakra-ui/react'
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle
} from '@/components/ui/dialog'
import {DataListItem, DataListRoot} from '@/components/ui/data-list'
import {ClipboardButton, ClipboardRoot} from '@/components/ui/clipboard'
import {CoverLetter} from '@/interfaces/CoverLetter'
import {PiMicrosoftWordLogoFill} from 'react-icons/pi'
import {Document, Packer, Paragraph, TextRun} from 'docx'

const CoverLetterDialog: React.FC<{ open: boolean, onClose: () => void, data: CoverLetter }> = ({
                                                                                                           open,
                                                                                                           onClose,
                                                                                                           data
                                                                                                       }) => {

    const dialogSize: 'xs' | 'lg' = useBreakpointValue({ base: 'xs', md: 'lg' })!

    const createDocument = async () => {
        const content = data.contents.split('\n')

        const doc = new Document({
            sections: [
                {
                    children: content.map((line) => {
                        return new Paragraph({
                            children: [
                                new TextRun({
                                    text: line,
                                    font: 'Aptos',
                                    size: 22
                                })
                            ]
                        })
                    })
                }
            ]
        })

        return await Packer.toBuffer(doc)
    }

    return <Box>
        <DialogRoot scrollBehavior='inside'  size={dialogSize} open={open}
                    onInteractOutside={onClose} onEscapeKeyDown={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cover Letter</DialogTitle>
                </DialogHeader>
                <DialogCloseTrigger onClick={onClose}/>
                <DialogBody>
                    <DataListRoot orientation='vertical'>
                        <DataListItem label='Company' value={data.company}/>
                        <DataListItem label='Title' value={data.job_title}/>
                        <DataListItem label='Content'
                                      value={<Text whiteSpace='pre-wrap'>
                                          {data.contents}
                                      </Text>}
                                      alignItems='flex-start'
                        />
                    </DataListRoot>
                </DialogBody>
                <DialogFooter style={{
                    marginTop: '5px',
                    justifyContent: 'flex-start'
                }}>
                    <ClipboardRoot value={data.contents} timeout={500}>
                        <ClipboardButton size='xs'/>
                    </ClipboardRoot>
                    <IconButton
                        size='xs'
                        variant='surface'
                        onClick={async () => {
                            const buffer = await createDocument()
                            const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `Cover Letter - ${data.company}.docx`
                            a.click()
                        }}>
                        <PiMicrosoftWordLogoFill color='#41A5EE'/>
                    </IconButton>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    </Box>
}

export default CoverLetterDialog
