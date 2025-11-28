import { cookies } from "next/headers";
import { API_URL } from "../constants/api";
import { getErrorMessage } from "./errors";

// const getHeaders = () => ({
//     Cookie: cookies().toString()
// })

const getHeaders = async () => {
  const cookieStore = await cookies();
  return {
    Cookie: cookieStore.toString(),
  };
};

export const post = async (path: string, formData: FormData) => {
    const res = await fetch(`${API_URL}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await getHeaders()) },
        body: JSON.stringify(Object.fromEntries(formData)),
    });
    const parsedRes = await res.json();
    if (!res.ok) {
        return { error: getErrorMessage(parsedRes) };
    }
    return { error: "" };
}

export const get = async (path: string) => {
    const res = await fetch(`${API_URL}/${path}`, {
        headers: { ...(await getHeaders()) },
    });
    return res.json();
}