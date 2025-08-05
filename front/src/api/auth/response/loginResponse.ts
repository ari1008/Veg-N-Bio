import { z } from "zod";

const LoginResponse =  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
})


export type LoginResponse = z.infer<typeof LoginResponse>