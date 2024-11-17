import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import Navbar from '@/components/NavBar'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { system } from '@/theme'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

function App({ Component }: AppProps) {
    return (
        <ChakraProvider value={system}>
            <Analytics/>
            <SpeedInsights/>
            <ColorModeProvider/>
            <Navbar/>
            <Component/>
        </ChakraProvider>
    )
}

export default App