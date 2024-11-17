import { createSystem, defaultConfig } from '@chakra-ui/react'

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            fonts: {
                body: { value: 'Inter, sans-serif' },
                heading: { value: 'Inter, sans-serif' }
            }
        }
    }
})