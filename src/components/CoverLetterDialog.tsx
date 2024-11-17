import React from 'react'
import {
    Box,
    Text,
} from '@chakra-ui/react'
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTitle
} from '@/components/ui/dialog'
import { DataListItem, DataListRoot } from '@/components/ui/data-list'
import { ClipboardButton, ClipboardRoot } from '@/components/ui/clipboard'
import { CoverLetter } from '@/interfaces/CoverLetter'

const CoverLetterDialog: React.FC<{ open: boolean, onClose: () => void, data: CoverLetter | null }> = ({ open, onClose, data }) => {
    return <Box>
        { data && (
            <DialogRoot scrollBehavior='inside' size='lg' open={open}
                        onInteractOutside={onClose} onEscapeKeyDown={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cover Letter</DialogTitle>
                    </DialogHeader>
                    <DialogCloseTrigger onClick={onClose} />
                    <DialogBody>
                        <DataListRoot orientation='horizontal'>
                            <DataListItem label='Company' value={data.company} />
                            <DataListItem label='Title' value={data.job} />
                            <DataListItem label='Content'
                                          value={
                                              <Text whiteSpace='pre-wrap'>
                                                  {data.content}
                                              </Text>
                                          }
                                          alignItems='flex-start'
                            />
                        </DataListRoot>
                        <ClipboardRoot value={data.content} timeout={500} >
                            <ClipboardButton />
                        </ClipboardRoot>
                    </DialogBody>
                </DialogContent>
            </DialogRoot>
        )}
    </Box>
}

export default CoverLetterDialog
