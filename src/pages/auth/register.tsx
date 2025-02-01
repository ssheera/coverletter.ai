import {
    Box,
    Input,
    Stack,
    Heading,
    Text,
    Center
} from '@chakra-ui/react'
import { Toaster, toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { createAxios } from '@/lib/axios'
import { Field } from '@/components/ui/field'
import { PasswordInput, PasswordStrengthMeter } from '@/components/ui/password-input'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const axios = createAxios()
            const res = await axios.post('/api/auth/register', { email, password })

            if (res.status == 201) {
                toaster.create({
                    title: 'Success',
                    description: 'You can now login to your user',
                    type: 'success',
                    duration: 3000,
                })
                setTimeout(async () => {
                    await router.push('/login')
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

    const handlePasswordStrength = (password: string) => {
        if (password.length < 8)
            return 0
        if (password.toLowerCase() === password)
            return 1
        if (!/\d/.test(password))
            return 2
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password))
            return 3
        return 4
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
                        Register
                    </Heading>
                    <Text fontSize='sm'>Create an account to continue</Text>
                </Stack>
                <Box mt={6} as='form' onSubmit={handleRegister}>
                    <Stack>

                        <Field required label='Email'>
                            <Input
                                id='email'
                                type='email'
                                placeholder='Email'
                                value={email}
                                variant='subtle'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Field>

                        <Field required label='Password'>
                            <PasswordInput
                                id='password'
                                type='password'
                                placeholder='Password'
                                value={password}
                                variant='subtle'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Field>
                        <PasswordStrengthMeter value={handlePasswordStrength(password)} />

                        <Button
                            type='submit'
                            width='full'
                            mt={4}
                            loading={isLoading}
                            loadingText={'Registering...'}
                        >
                            Register
                        </Button>
                    </Stack>
                </Box>
                <Text mt={4} fontSize='sm'>
                    Already have an account?{' '}
                    <a style={{
                        paddingLeft: '0.5rem',
                        cursor: 'pointer'
                    }} onClick={() => router.push('/auth/login')}>
                        Login
                    </a>
                </Text>
            </Box>
        </Center>
    )
}
