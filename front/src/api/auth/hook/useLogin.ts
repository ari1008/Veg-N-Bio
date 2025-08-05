import {useMutation, type UseMutationResult} from "@tanstack/react-query";
import type {LoginDto} from "../dto/loginDto.ts";
import type {LoginResponse} from "../response/loginResponse.ts";
import {postLogin} from "../auth.ts";


export const useLogin = (): UseMutationResult<LoginResponse, unknown, LoginDto> =>
    useMutation({
        mutationFn: (data: LoginDto) => postLogin(data),
    });