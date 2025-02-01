import {Button, Container, Flex, Heading, Stack, Text} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useAuth} from '@/context/AuthProvider'

export default function HomePage() {
    const router = useRouter()
    const auth = useAuth()
    return (<>
            <Head>
                <title>Home</title>
            </Head>
            <Container maxW='container.md' centerContent>
                <Flex height='100vh' direction='column' justifyContent='center' textAlign='center'>
                    <Heading as='h1' size='2xl'>
                        CoverLetter.ai
                    </Heading>
                    <Text mt={4} fontSize='lg'>
                        Generate specialised cover letters in seconds
                    </Text>
                    <Stack mt={8} direction='column' align='center'>
                        <Button
                            onClick={() => router.push(auth.isAuthenticated ? '/tasks/generate' : '/auth/login')}>
                            Get Started
                        </Button>
                    </Stack>
                </Flex>
            </Container>
        </>)
}
