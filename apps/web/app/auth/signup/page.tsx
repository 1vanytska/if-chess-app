"use client";

import { Button, Stack, TextField, Link } from "@mui/material";
import NextLink from "next/link";
import createUser from "./create-user";
import React, { startTransition } from "react";

export default function Signup() {
  const [state, formAction] = React.useActionState(createUser, { error: "" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (typeof grecaptcha === "undefined") {
      console.error("reCAPTCHA script not loaded yet");
      return;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.error("Missing reCAPTCHA site key");
      return;
    }

    grecaptcha.ready(async () => {
      const token = await grecaptcha.execute(siteKey, { action: "submit" });

      const formData = new FormData(form);
      formData.append("recaptchaToken", token);

      startTransition(() => {
        formAction(formData);
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs">
      <Stack spacing={2}>
        <TextField
          name="email"
          label="Email"
          variant="outlined"
          type="email"
          helperText={state.error}
          error={!!state.error}
        />
        <TextField
          name="password"
          label="Password"
          variant="outlined"
          type="password"
          helperText={state.error}
          error={!!state.error}
        />
        <Button type="submit" variant="contained">
          Signup
        </Button>
        <Link component={NextLink} href="/auth/login" className="self-center">
          Login
        </Link>
      </Stack>
    </form>
  );
}