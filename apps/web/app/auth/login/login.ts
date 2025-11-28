"use server";

import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";
import { FormError } from "../../common/interfaces/form-error.interface";
import { API_URL } from "../../common/constants/api";
import { getErrorMessage } from "../../common/util/errors";
import { cookies } from "next/headers";

export default async function login(_prevState: FormError, formData: FormData) {
    const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        const parsedRes = await res.json();
        if (!res.ok) {
            return { error: getErrorMessage(parsedRes) };
        }
        await setAuthCookie(res);
        redirect("/");
}

const setAuthCookie = async (response: Response) => {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (setCookieHeader) {
    const token = setCookieHeader.split(";")[0]?.split("=")[1];
    if (token) {
      (await cookies()).set({
        name: "Authentication",
        value: token,
        secure: true,
        httpOnly: true,
        path: "/",
        sameSite: "lax", 
        expires: new Date(jwtDecode(token).exp! * 1000),
      });
    }
  }
};