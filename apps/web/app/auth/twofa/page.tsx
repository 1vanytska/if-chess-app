"use client";

import { Button, Stack, TextField, Typography } from "@mui/material"
import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import authenticate2FA from "./authenticate-2fa";

export default function TwoFaPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const [state, formAction] = useActionState(authenticate2FA, { error: "", userId });

    useEffect(() => {
        if (!userId) {
            globalThis.location.href = '/auth/login'; 
        }
    }, [userId]);

    if (!userId) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <form action={formAction} className="w-full max-w-xs">
            <Stack spacing={2} className="w-full max-w-xs">
                <Typography variant="h6" component="h1" align="center">
                    Введіть код 2FA
                </Typography>
                <Typography variant="body2" align="center" color="textSecondary">
                    Будь ласка, введіть 6-значний код із вашого додатку-автентифікатора.
                </Typography>
                
                <input type="hidden" name="userId" value={userId} />

                <TextField 
                    error={!!state.error} 
                    helperText={state.error} 
                    name="twoFACode" 
                    label="2FA Code" 
                    variant="outlined" 
                    type="text" 
                />

                <Button type="submit" variant="contained">Підтвердити</Button>
            </Stack>
        </form>
    );
}