import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import {useAuth} from '@/context/AuthProvider'
import {Flex, Spinner} from '@chakra-ui/react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!auth.loading && !auth.isAuthenticated) {
            router.push('/auth/login').catch(console.error)
        }
    }, [auth.isAuthenticated, auth.loading, router])

    if (auth.loading) {
        return <Flex direction='column' align='center' justify='center' h='100vh'>
            <Spinner />
        </Flex>
    }

    if (auth.isAuthenticated) {
        return <>{children}</>
    }

    return null
}

export default ProtectedRoute