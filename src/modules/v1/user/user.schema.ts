import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const userCore = {
    email: z.string({
        required_error: 'Alamat email wajib diisi',
        invalid_type_error: 'Alamat email harus berupa string',
    }).email(),
    name: z.string({
        required_error: 'Nama wajib diisi',
        invalid_type_error: 'Nama harus berupa string',
    }),
}

const createUserSchema = z.object({
    ...userCore,
    password: z.string({
        required_error: 'Password wajib diisi',
        invalid_type_error: 'Password harus berupa string',
    }),
})

const loginSchema = z.object({
    email: z.string({
        required_error: 'Alamat email wajib diisi',
        invalid_type_error: 'Alamat email harus berupa string',
    }).email(),
    password: z.string({
        required_error: 'Password wajib diisi',
        invalid_type_error: 'Password harus berupa string',
    }),
})

const refreshSchema = z.object({
    refreshToken: z.string({
        required_error: 'Error code 10'
    })
})

const updateSchema = z.object({
    name: z.string().optional(),
    avatar: z.string().optional()
})

const loginResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})


const userMeResponse = z.object({
    ...userCore,
    id: z.string(),
    avatar: z.string(),
    role: z.string(),
    usingAvatar: z.boolean()
})

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
    createUserSchema,
    loginSchema,
    updateSchema,
    refreshSchema,
    loginResponseSchema,
    userMeResponse
});