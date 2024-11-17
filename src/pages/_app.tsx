import type { AppProps } from 'next/app'
import { ChakraProvider } from "@chakra-ui/react"
import Navbar from "@/components/NavBar";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { system } from "@/theme";

function App({ Component }: AppProps) {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider/>
            <Navbar/>
            <Component/>
        </ChakraProvider>
    )
}

export default App