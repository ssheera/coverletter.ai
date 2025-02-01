import React from 'react'
import {
    Box,
    Flex,
    HStack,
    Link
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useAuth } from '@/context/AuthProvider'

const NavLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <Link
        as={NextLink}
        px={2}
        py={1}
        rounded={'md'}
        fontSize='xs'
        _hover={{
            textDecoration: 'none',
        }}
        href={href}
    >
        {children}
    </Link>
)

const Navbar: React.FC = () => {

    const auth = useAuth()

    return (
        <Box px={4} position='absolute' w='100%' shadow='lg' zIndex={2}>
            <Flex h={16} alignItems='center' justifyContent='space-between'>
                <HStack alignItems='center'>
                    <HStack as='nav' display='flex'>
                        <NavLink key='home' href='/'>
                            Home
                        </NavLink>
                        { auth.isAuthenticated && (
                            <>
                                <NavLink key='generate' href='/tasks/generate'>
                                    Generate
                                </NavLink>
                                <NavLink key='resume' href='/tasks/resume'>
                                    Tailoring
                                </NavLink>
                                <NavLink key='dashboard' href='/dashboard'>
                                    Dashboard
                                </NavLink>
                            </>
                        ) }
                    </HStack>
                </HStack>
                <HStack alignItems='flex-end'>
                    <HStack as='nav' display='flex'>
                        { !auth.isAuthenticated ? (
                            <>
                                <NavLink key='login' href='/auth/login'>
                                    Login
                                </NavLink>
                                <NavLink key='register' href='/auth/register'>
                                    Register
                                </NavLink>
                            </>
                        ) : (
                            <NavLink key='logout' href='/auth/logout'>
                                Logout
                            </NavLink>
                        )}
                    </HStack>
                </HStack>
            </Flex>
        </Box>
    )
}

export default Navbar
