"use server";

import { FormError } from "../common/interfaces/form-error.interface";
import { API_URL } from "../common/constants/api";
import { getErrorMessage } from "../common/util/errors";

interface TwoFAResponseData {
    qrCodeDataUrl?: string;
    secret?: string;
}

interface TwoFAState extends FormError {
    data?: TwoFAResponseData;
    success?: boolean;
}

const getHeaders = async () => {
    const cookieStore = await import("next/headers").then(mod => mod.cookies());
    return {
        Cookie: cookieStore.toString(),
    };
};

export async function enable2FA(_prevState: TwoFAState, formData: FormData): Promise<TwoFAState> {
    const res = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getHeaders()) },
        body: JSON.stringify({}),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
        return { error: getErrorMessage(parsedRes) };
    }

    return { error: "", data: parsedRes as TwoFAResponseData };
}

export async function confirm2FA(_prevState: TwoFAState, formData: FormData): Promise<TwoFAState> {
    const code = formData.get("code");

    if (!code) {
        return { error: "Please enter the 6-digit code." };
    }

    const res = await fetch(`${API_URL}/auth/2fa/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getHeaders()) },
        body: JSON.stringify({ code }),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
        return { error: getErrorMessage(parsedRes) };
    }

    return { error: "", success: true };
}

export async function disable2FA(_prevState: TwoFAState, formData: FormData): Promise<TwoFAState> {
    const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getHeaders()) },
        body: JSON.stringify({}),
    });

    const parsedRes = await res.json();

    if (!res.ok) {
        return { error: getErrorMessage(parsedRes) };
    }

    return { error: "", success: true };
}