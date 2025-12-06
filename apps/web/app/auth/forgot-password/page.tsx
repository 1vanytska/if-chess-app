"use client";

import { Button, Stack, TextField, Typography } from "@mui/material";
import { useActionState } from "react";
import forgotPassword from "./forgot-password";

export default function ForgotPassword() {
  const [state, formAction] = useActionState(forgotPassword, { error: "", success: "" });

  return (
    <form action={formAction} className="w-full max-w-xs">
      <Stack spacing={2} className="w-full max-w-xs">
        <Typography variant="h6">Forgot Password</Typography>
        <TextField
          error={!!state.error}
          helperText={state.error}
          name="email"
          label="Email"
          variant="outlined"
          type="email"
        />
        <Button type="submit" variant="contained">Send reset link</Button>
        {state.success && (
          <Typography color="success.main">{state.success}</Typography>
        )}
      </Stack>
    </form>
  );
}