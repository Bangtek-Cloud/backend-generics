import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUser, findUserByEmail } from "./user.service";
import { CreateUserInput, LoginInput } from "./user.schema";
import { verifyPassword } from "../../../utils/hash";
import { server } from "../../../server";

export async function registerHandler(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    const body = request.body
    try {
        const findUser = await findUserByEmail(body.email)
        if (findUser) {
            return reply.code(400).send({ message: "Email sudah terdaftar, silahkan gunakan email lain" })
        }
        const user = await createUser(body)
        return reply.code(201).send(user)
    } catch (error) {
        console.error(error)
        return reply.code(400).send(error)
    }

}
export async function loginHandler(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    const body = request.body;
    try {
        const user = await findUserByEmail(body.email);
        if (!user) {
            return reply.code(400).send({ message: "Email atau password yang anda masukan salah" });
        }

        const correctPassword = verifyPassword({
            candidatePassword: body.password,
            salt: user.salt,
            hash: user.password,
        });

        if (correctPassword) {
            const users = {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                publicMeta: {
                    role: user.role
                }
            }
            const accessToken = server.jwt.sign(users, { expiresIn: '1d' });
            const refreshToken = server.jwt.sign(users, { expiresIn: '7d' });

            return reply.send({ accessToken, refreshToken });
        }

        return reply.code(400).send({ message: "Email atau password yang anda masukan salah" });
    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Terjadi kesalahan server", error });
    }
}

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
    const id = request.user.id;
    const users = await findUser(id);
    return users;
}
