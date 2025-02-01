import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { ClientUser } from '@/interfaces/User'

interface AuthContextType {
    user: ClientUser | null
    loading: boolean
    isAuthenticated: boolean
    refreshAuth: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<ClientUser | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await axios.get('/api/auth/verify', { withCredentials: true })
            setUser(response.data.user)
        } catch (error) {
            setUser(null)
            console.log('An error occurred:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = async () => {
        await axios.post('/api/auth/logout', {}, { withCredentials: true })
        setUser(null)
        await router.push('/auth/login')
    }

    const refreshAuth = async () => {
        setLoading(true)
        await checkAuthStatus()
    }

    useEffect(() => {
        checkAuthStatus().catch(console.error)
    }, [checkAuthStatus])

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refreshAuth, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
