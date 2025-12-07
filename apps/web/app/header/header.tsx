"use client";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { AuthContext } from '../auth/auth-context';
import { useContext, useState } from 'react';
import Link from "next/link";
import { routes, unauthenticatedRoutes } from '../common/constants/routes';
import { useRouter } from 'next/navigation';

export function WhiteKnightIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props} viewBox="0 0 45 45">
            <path
                d="M22.5 11.63L21.36 10.5C20.67 9.8 19.8 9.32 18.84 9.07C17.88 8.82 16.86 8.8 15.86 9.01C14.86 9.21 13.9 9.64 13.06 10.26C12.22 10.88 11.53 11.68 11.05 12.6C10.56 13.52 10.3 14.54 10.28 15.58C10.26 16.63 10.47 17.66 10.9 18.6C11.33 19.53 11.98 20.36 12.8 20.98C12.8 20.98 19 23 20 31C16.5 31.5 13.5 30 13 25C13 25 10 25 9.5 28C9 31 10.5 32 11.5 32C12.5 32 15 30.5 16.5 30.5C18 30.5 22 33 24 33C26 33 31 28.5 31 23C31 18.5 25.5 14 22.5 11.63Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1"
            />
            <path
                d="M9 36C9 36 13 36 14 36.5C15 37 16 38 19 38C22 38 29 37 30.5 36.5C32 36 36 36 36 36C36 36 37 39 36 39.5C35 40 28.5 40.5 22.5 40.5C16.5 40.5 9 40 8 39.5C7 39 8 36 9 36Z"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="1"
            />
        </SvgIcon>
    );
}

interface HeaderProps {
    readonly logout: () => Promise<void>;
}

export default function Header({ logout }: HeaderProps) {
    const IsAuthenticated = useContext(AuthContext);
    const router = useRouter();

    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const pages = IsAuthenticated ? routes : unauthenticatedRoutes;

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <WhiteKnightIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Івано-Франківська федерація шахів
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.title} onClick={() => {
                                    router.push(page.path);
                                    handleCloseNavMenu();
                                }}>
                                    <Typography sx={{ textAlign: 'center' }}>{page.title}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <WhiteKnightIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Івано-Франківська федерація шахів
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page.title}
                                onClick={() => {
                                    router.push(page.path);
                                    handleCloseNavMenu();
                                }}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page.title}
                            </Button>
                        ))}
                    </Box>
                    {IsAuthenticated && <Settings logout={logout}/>}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

const Settings = ({ logout }: HeaderProps) => {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                <MenuItem key="Logout" onClick={async () => {
                    await logout();
                    handleCloseUserMenu();
                }}>
                    <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                </MenuItem>
            </Menu>
        </Box>
    )
}