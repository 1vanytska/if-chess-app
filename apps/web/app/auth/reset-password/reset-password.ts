"use server";

import { API_URL } from "../../common/constants/api";
import { getErrorMessage } from "../../common/util/errors";

interface ResetPasswordState {
  error?: string;
  success?: string;
}

export default async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const data = Object.fromEntries(formData);
  if (data.newPassword !== data.confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: data.token,
      newPassword: data.newPassword,
    }),
  });

  const parsedRes = await res.json();

  if (!res.ok) {
    return { error: getErrorMessage(parsedRes) };
  }

  return { success: "Password successfully reset. You can now log in." };
}