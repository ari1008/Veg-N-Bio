import {useMutation, type UseMutationResult} from "@tanstack/react-query";
import type {LoginResponse} from "../response/loginResponse.ts";
import {postRefreshToken} from "../auth.ts";


export const  useRefreshToken = (): UseMutationResult<LoginResponse, unknown, String> =>
    useMutation({
        mutationFn: (data: string) => postRefreshToken(data)
    })