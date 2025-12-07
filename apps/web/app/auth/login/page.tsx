"use client";

import { Button, Stack, TextField, Link } from "@mui/material"
import NextLink from 'next/link';
import { useActionState, useEffect } from "react";
import login from "./login";
import { useRouter } from 'next/navigation';

export default function Login() {
    const [state, formAction] = useActionState(login, { error: "", requires2FA: false, userId: null });
    const router = useRouter();

    useEffect(() => {
        if (state.requires2FA && state.userId) {
            router.push(`/auth/twofa?userId=${state.userId}`);
        }
    }, [state, router]);


    return (
        <form action={formAction} className="w-full max-w-xs">
            <Stack spacing={2} className="w-full max-w-xs">
                <TextField error={!!state.error && !state.requires2FA} helperText={state.error} name="email" label="Email" variant="outlined" type="email" />
                <TextField error={!!state.error && !state.requires2FA} helperText={state.error} name="password" label="Password" variant="outlined" type="password" />
                <Button type="submit" variant="contained">Login</Button>
                <small><Link component={NextLink} href="/auth/forgot-password" className="self-left">
                    Forgot password?
                </Link></small>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => globalThis.location.href = "http://localhost:3003/auth/google"}
                >
                    Увійти через Google
                </Button>
                <Link component={NextLink} href="/auth/signup" className="self-center">
                    Signup
                </Link>
            </Stack>
        </form>
    )
}