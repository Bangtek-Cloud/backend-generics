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

const createUserResponseSchema = z.object({
    ...userCore,
    id: z.string(),
    avatar: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

const loginResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema
});