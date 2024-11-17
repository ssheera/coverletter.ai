import React from 'react'
import {
    Box,
    Flex,
    HStack,
    Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'

const links = [
    { label: 'Home', href: '/' },
    { label: 'Analysis', href: '/analysis' },
    { label: 'Dashboard', href: '/dashboard' },
]

const account = [
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' }
]


const NavLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <Link
        as={NextLink}
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
        }}
        href={href}
    >
        {children}
    </Link>
)

const Navbar: React.FC = () => {
    return (
        <Box px={4} position='absolute' w='100%' shadow='lg'>
            <Flex h={16} alignItems='center' justifyContent='space-between'>
                <HStack alignItems='center'>
                    <HStack as='nav' display='flex'>
                        { links.map((link) => (
                            <NavLink key={link.label} href={link.href}>
                                {link.label}
                            </NavLink>
                        ))}
                    </HStack>
                </HStack>
                <HStack alignItems='flex-end'>
                    <HStack as='nav' display='flex'>
                        { account.map((link) => (
                            <NavLink key={link.label} href={link.href}>
                                {link.label}
                            </NavLink>
                        ))}
                    </HStack>
                </HStack>
            </Flex>
        </Box>
    )
}

export default Navbar
