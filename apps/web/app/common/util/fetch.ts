"use server";

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
  const url = `${API_URL}/${path}`;
  const headers = { "Content-Type": "application/json", ...(await getHeaders()) };
  const payload = Object.fromEntries(formData);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "include",
  });

  let parsedRes;
  try {
    parsedRes = await res.json();
  } catch (e) {
    return { error: "Invalid JSON response from backend" };
  }

  if (!res.ok) {
    const message = getErrorMessage(parsedRes);
    return { error: message };
  }

  return { error: "" };
};

export const get = async (path: string) => {
    const res = await fetch(`${API_URL}/${path}`, {
        headers: { ...(await getHeaders()) },
    });
    return res.json();
}