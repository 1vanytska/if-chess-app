"use server";

import { redirect } from "next/navigation";
import { API_URL } from "../../common/constants/api";
import { getErrorMessage } from "../../common/util/errors";
import { post } from "../../common/util/fetch";
import { FormError } from "../../common/interfaces/form-error.interface";

export default async function createUser(_prevState: FormError, formData: FormData) {
    const { error } =await post("users", formData);
    if (error) {
        return { error }
    }
    redirect("/")
}