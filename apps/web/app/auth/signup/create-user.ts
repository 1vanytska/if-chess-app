"use server";

import { redirect } from "next/navigation";
import { API_URL } from "../../constants/api";
import { getErrorMessage } from "../../util/errors";

export default async function createUser(_prevState: any, formData: FormData) {
    const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        body: formData
    });
    const parsedRes = await res.json();
    if (!res.ok) {
        return { error: getErrorMessage(parsedRes) };
    }
    redirect("/");
}