import {
    Box,
    Input,
    Stack,
    Heading,
    Text,
    Center
} from '@chakra-ui/react'
import { Toaster, toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { createAxios } from '@/util/axios'
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const axios = createAxios()
            const res = await axios.post('/api/login', { email, password })

            if (res.status == 200) {
                toaster.create({
                    title: 'Success',
                    description: 'You can now access your account',
                    type: 'success',
                    duration: 3000,
                })
                localStorage.setItem('token', res.data.token)
                setTimeout(async () => {
                    await router.push('/analysis')
                }, 1000)
            } else {
                toaster.error({
                    title: 'Failed',
                    description: res.data.message,
                    duration: 3000,
                })
            }
        } catch (error) {
            toaster.error({
                title: 'Failed',
                description: 'Please try again later',
                duration: 3000,
            })
            console.log('An error occurred:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Center minHeight='100vh'>
            <Toaster />
            <Box
                p={8}
                shadow='lg'
                maxW='sm'
                mx='auto'
                width='100%'
            >
                <Stack align='center' textAlign='center'>
                    <Heading size='lg'>
                        Login
                    </Heading>
                    <Text fontSize='sm'>Sign into your account to continue</Text>
                </Stack>
                <Box mt={6} as='form' onSubmit={handleLogin}>
                    <Stack>

                        <Field required label="Email">
                            <Input
                                id='email'
                                type='email'
                                placeholder='Email'
                                value={email}
                                variant='subtle'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Field>

                        <Field required label="Password">
                            <PasswordInput
                                id='password'
                                type='password'
                                placeholder='Password'
                                value={password}
                                variant='subtle'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Field>

                        <Button
                            type='submit'
                            width='full'
                            mt={4}
                            loading={isLoading}
                            loadingText={'Logging in...'}
                        >
                            Login
                        </Button>
                    </Stack>
                </Box>
                <Text mt={4} fontSize='sm'>
                    Don&#39;t have an account?{' '}
                    <a style={{
                        paddingLeft: '0.5rem',
                        cursor: 'pointer'
                    }} onClick={() => router.push('/register')}>
                        Register
                    </a>
                </Text>
            </Box>
        </Center>
    )
}
