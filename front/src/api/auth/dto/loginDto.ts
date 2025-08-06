import { z } from "zod";

export const LoginDto = z.object({
    username: z.string(),
    password: z.string(),
    role: z.string().default("RESTAURANT_OWNER"),
});


export type LoginDto = z.infer<typeof LoginDto>