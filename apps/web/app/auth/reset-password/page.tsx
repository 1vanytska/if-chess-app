"use client";

import { Button, Stack, TextField, Typography } from "@mui/material";
import { useActionState } from "react";
import resetPassword from "./reset-password";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction] = useActionState(resetPassword, { error: "", success: "" });

  return (
    <form action={formAction} className="w-full max-w-xs">
      <Stack spacing={2} className="w-full max-w-xs">
        <Typography variant="h6">Reset Password</Typography>
        <input type="hidden" name="token" value={token ?? ""} />
        <TextField
          error={!!state.error}
          helperText={state.error}
          name="newPassword"
          label="New Password"
          variant="outlined"
          type="password"
        />
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          variant="outlined"
          type="password"
        />
        <Button type="submit" variant="contained">Reset Password</Button>
        {state.success && (
          <Typography color="success.main">{state.success}</Typography>
        )}
      </Stack>
    </form>
  );
}