"use client";

import { Button, Stack, TextField, Link } from "@mui/material"
import NextLink from 'next/link';
import createUser from "./create-user";
import React from "react";

export default function Signup() {
    const [state, formAction] = React.useActionState(createUser, { error: "" });

    return (
        <form action={formAction} className="w-full max-w-xs">
            <Stack spacing={2}>
                <TextField name="email" label="Email" variant="outlined" type="email" helperText={state.error} error={!!state.error}/>
                <TextField name="password" label="Password" variant="outlined" type="password" helperText={state.error} error={!!state.error}/>
                <Button type="submit" variant="contained">
                    Signup
                </Button>
                <Link component={NextLink} href="/auth/login" className="self-center">
                    Login
                </Link>
            </Stack>
        </form>
    )
}