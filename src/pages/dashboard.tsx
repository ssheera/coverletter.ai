import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    useDisclosure,
    HStack,
    Stack,
    Table, Spinner, Input
} from '@chakra-ui/react'
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from '@/components/ui/pagination'
import React, {useEffect, useMemo, useState} from 'react'
import { CoverLetter } from '@/interfaces/CoverLetter'
import { createAxios } from '@/lib/axios'
import CoverLetterDialog from '@/components/CoverLetterDialog'
import { Toaster, toaster } from '@/components/ui/toaster'
import { InputGroup } from '@/components/ui/input-group'
import { LuSearch } from 'react-icons/lu'
import { EmptyState } from '@/components/ui/empty-state'
import { HiColorSwatch } from 'react-icons/hi'
import { AccountUser } from '@/interfaces/User'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ProtectedDashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardPage />
        </ProtectedRoute>
    )
}

function DashboardPage() {
    const { open, onOpen, onClose } = useDisclosure()
    const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null)
    const [search, setSearch] = useState<string>('')
    const [page, setPage] = useState(1)
    const [userDetails, setUserDetails] = useState<AccountUser | null>(null)

    const axios = createAxios()

    const pageSize = 10

    const fetchData = useMemo(() => {
        return async () => {
            try {
                const res = await axios.get('/api/user/account',  { withCredentials: true })
                if (res.status === 200) {
                    setUserDetails(res.data)
                    toaster.create({
                        title: 'Success',
                        description: 'User fetched successfully',
                        type: 'success',
                        duration: 3000,
                    })
                } else {
                    toaster.error({
                        title: 'Error fetching user',
                        description: res.data.message,
                        type: 'error',
                        duration: 3000,
                    })
                }
            } catch (error) {
                toaster.error({
                    title: 'An error occurred',
                    type: 'error',
                    duration: 3000,
                })
                console.error('An error occurred:', error)
            }
        }
    }, [axios])

    useEffect(() => {
        if (!userDetails) {
            fetchData()
                .catch((error) => {
                    console.error('An error occurred:', error)
                })
        }
    }, [fetchData, userDetails])


    const filteredLetters = useMemo(() => {
        if (!userDetails) return []
        return userDetails.coverLetters
          .filter(letter => letter.company.toLowerCase().includes(search.toLowerCase())
            || letter.job_title.toLowerCase().includes(search.toLowerCase()))
          .reverse()
    }, [userDetails, search])

    const handleLetterClick = (letter: CoverLetter) => {
        setSelectedLetter(letter)
        onOpen()
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    return (
        <Container maxW='7xl' py={20}>
            <Toaster/>

            <Flex justify='space-between' align='center' my={8}>
                <Box>
                    <Heading size='lg'>Dashboard</Heading>
                    <Text color='gray.500' mt={2}>
                        {userDetails && 'Welcome back, ' + userDetails.email || <Spinner mt={2}/>}
                    </Text>
                </Box>
            </Flex>

            { userDetails && userDetails.coverLetters.length > 0 && (
                <Stack width='full' gap='5'>
                        <Heading size='xl'>Cover Letters</Heading>
                        <Text fontSize='sm' color='gray'>
                            Your cover letters are listed below, click on a row to view the cover letter
                        </Text>
                        <InputGroup
                            flex='1'
                            maxW='sm'
                            startElement={<LuSearch />}
                        >
                            <Input size='sm' placeholder='Search' value={search} onChange={handleSearch} />
                        </InputGroup>
                        <Table.Root size='sm' variant='outline' striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                                    <Table.ColumnHeader>Company</Table.ColumnHeader>
                                    <Table.ColumnHeader>Job Title</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    filteredLetters
                                      .slice((page - 1) * pageSize, ((page - 1) * pageSize) + pageSize)
                                      .map((letter, index) => (
                                    <Table.Row key={index} onClick={() => handleLetterClick(letter)}>
                                        <Table.Cell> {
                                            letter.date.toLocaleDateString()
                                        } </Table.Cell>
                                        <Table.Cell>{letter.company}</Table.Cell>
                                        <Table.Cell>{letter.job_title}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>

                        <PaginationRoot
                            size='xs'
                            page={page}
                            count={filteredLetters.length}
                            pageSize={pageSize}
                            onPageChange={(e) => setPage(e.page)}
                            style={{
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <HStack>
                                <PaginationPrevTrigger />
                                <PaginationItems />
                                <PaginationNextTrigger />
                            </HStack>
                        </PaginationRoot>
                    </Stack>
            ) || userDetails && (
                <EmptyState
                    icon={<HiColorSwatch />}
                    title='No results found'
                    description='Try creating a new cover letter'
                />
            ) }

            { selectedLetter && open && (
                <CoverLetterDialog data={selectedLetter} open={open} onClose={onClose} />
            )}

        </Container>
    )
}