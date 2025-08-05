import {useMutation, type UseMutationResult} from "@tanstack/react-query";
import type {LoginResponse} from "../response/loginResponse.ts";
import {postLogout} from "../auth.ts";


export const useLogout = (): UseMutationResult<Map<string, any>, unknown, String> =>
    useMutation({
        mutationFn: (data: String) => postLogout(data)
    })