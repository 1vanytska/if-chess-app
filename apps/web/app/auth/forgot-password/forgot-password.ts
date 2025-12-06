"use server";

import { API_URL } from "../../common/constants/api";
import { getErrorMessage } from "../../common/util/errors";

interface ForgotPasswordState {
  error?: string;
  success?: string;
}

export default async function forgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const res = await fetch(`${API_URL}/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData)),
  });

  const parsedRes = await res.json();

  if (!res.ok) {
    return { error: getErrorMessage(parsedRes) };
  }

  return { success: "Password reset link sent to your email" };
}