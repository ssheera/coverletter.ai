import { Heading, Text, Button, Stack, Container, Flex } from '@chakra-ui/react'
import { useRouter } from "next/router";

export default function HomePage() {
    const router = useRouter()
    return (
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
                            onClick={() => router.push(
                                window.localStorage.getItem('token') ? '/analysis' : '/login'
                            )}>
                        Get Started
                    </Button>
                </Stack>
            </Flex>
        </Container>
    )
}
