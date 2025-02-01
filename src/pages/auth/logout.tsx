import { useAuth } from '@/context/AuthProvider'
import { useEffect } from 'react'

export default function LoginPage() {
    const auth = useAuth()
    useEffect(() => {
        auth.logout().then(auth.refreshAuth)
    })
}
