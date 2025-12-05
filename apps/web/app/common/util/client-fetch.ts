import { API_URL } from "../constants/api";
import { getErrorMessage } from "./errors";

export const postClient = async (path: string, formData: FormData) => {
  const url = `${API_URL}/${path}`;
  const headers = { "Content-Type": "application/json" };
  const payload = Object.fromEntries(formData);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
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

export const getClient = async (path: string) => {
  const res = await fetch(`${API_URL}/${path}`);
  return res.json();
};