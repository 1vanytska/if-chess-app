"use server";

import { redirect } from "next/navigation";
import { FormError } from "../../common/interfaces/form-error.interface";
import { API_URL } from "../../common/constants/api";
import { getErrorMessage } from "../../common/util/errors";
import { setAuthCookie } from "../login/login";

interface TwoFAState extends FormError {
    userId: string | null;
}

export default async function authenticate2FA(_prevState: TwoFAState, formData: FormData): Promise<TwoFAState> {
    const userId = formData.get('userId');
    const twoFACode = formData.get('twoFACode');
    
    if (!userId || !twoFACode) {
        return { error: "Missing user ID or 2FA code.", userId: userId as string };
    }

    const res = await fetch(`${API_URL}/auth/2fa/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), twoFACode }),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
        return { error: getErrorMessage(parsedRes), userId: userId as string };
    }

    await setAuthCookie(res);
    redirect("/");
}