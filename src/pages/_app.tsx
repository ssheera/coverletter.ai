import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Navbar from '@/components/NavBar'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { system } from '@/theme'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Head from 'next/head'
import { AuthProvider } from '@/context/AuthProvider'

function App({ Component }: AppProps) {
    return (
        <ChakraProvider value={system}>
            <AuthProvider>
                <Head>
                    <meta name='description' content='applying to jobs made easy' />
                    <link rel='icon' href='/vercel.svg' />
                </Head>
                <Analytics/>
                <SpeedInsights/>
                <ColorModeProvider/>
                <Navbar/>
                <Component/>
            </AuthProvider>
        </ChakraProvider>
    )
}

export default App