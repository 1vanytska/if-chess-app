"use server";

import { redirect } from "next/navigation";
import { API_URL } from "../../constants/api";
import { getErrorMessage } from "../../util/errors";
import { post } from "../../util/fetch";
import { FormError } from "../../common/form-error.interface";

export default async function createUser(_prevState: FormError, formData: FormData) {
    const { error } =await post("users", formData);
    if (error) {
        return { error }
    }
    redirect("/")
}