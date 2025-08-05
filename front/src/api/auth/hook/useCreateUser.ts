import type {CreateUser} from "../dto/createUserDto.ts";
import {useMutation, type UseMutationResult} from "@tanstack/react-query";
import {postCreateUser} from "../auth.ts";

export const useCreateUser = (): UseMutationResult<Map<string, any>, unknown, CreateUser> =>
    useMutation({
        mutationFn: (data: CreateUser) => postCreateUser(data),
    });