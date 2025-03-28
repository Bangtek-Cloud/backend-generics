import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUser, findUserByEmail, updateUser } from "./user.service";
import { CreateUserInput, LoginInput, RefreshInput, UpdateInput } from "./user.schema";
import { verifyPassword } from "../../../utils/hash";
import { server } from "../../../server";
import { JWTPayload } from "src/types";

export async function registerHandler(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    const body = request.body
    try {
        const findUser = await findUserByEmail(body.email)
        if (findUser) {
            return reply.code(400).send({ message: "Email sudah terdaftar, silahkan gunakan email lain" })
        } else {
            const user = await createUser(body)
            const users = {
                id: user.id,
                email: user.email
            }
            const accessToken = server.jwt.sign(users, { expiresIn: '1d' });
            const refreshToken = server.jwt.sign(users, { expiresIn: '7d' });

            await server.redis.del(`loginAccess:${user.id}`);

            const tokenizer = JSON.stringify({
                accessToken,
                refreshToken,
            })
            await server.redis.setex(`loginAccess:${user.id}`, 86400, tokenizer);
            return reply.send({ accessToken, refreshToken });
        }
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
                email: user.email
            }
            const accessToken = server.jwt.sign(users, { expiresIn: '1d' });
            const refreshToken = server.jwt.sign(users, { expiresIn: '7d' });

            await server.redis.del(`loginAccess:${user.id}`);

            const tokenizer = JSON.stringify({
                accessToken,
                refreshToken,
            })
            await server.redis.setex(`loginAccess:${user.id}`, 86400, tokenizer);

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
    const [users] = await Promise.all([findUser(id)]);
    return users;
}

export async function updateHandler(request: FastifyRequest<{ Body: UpdateInput }>, reply: FastifyReply) {
    try {
        const id = request.user.id;
        const body = request.body
        await updateUser(id, body)
        return reply.code(200).send({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Terjadi kesalahan server", error });
    }
}

export async function refreshHandler(request: FastifyRequest<{ Body: RefreshInput }>, reply: FastifyReply) {
    try {
        const refresh = request.body?.refreshToken
        const decoded = await server.jwt.verify<JWTPayload>(refresh);
        if (!decoded) {
            return reply.status(500).send({ message: "Terjadi kesalahan code 11" })
        }
        const redisAccessToken = await server.redis.get(`loginAccess:${decoded.id}`);

        if (!redisAccessToken) {
            return reply.code(403).send({
                code: 403,
                error: "Akses ditolak. Token tidak ditemukan di server.",
            });
        }
        const redisParse = JSON.parse(redisAccessToken);
        if (refresh !== redisParse.refreshToken) {
            return reply.status(403).send({ message: "Sesi sudah berakhir, silahkan login ulang" })
        }
        const user = await findUser(decoded.id)
        const users = {
            id: user.id,
            email: user.email
        }
        const accessToken = server.jwt.sign(users, { expiresIn: '1d' });
        const refreshToken = server.jwt.sign(users, { expiresIn: '7d' });

        await server.redis.del(`loginAccess:${user.id}`);

        const tokenizer = JSON.stringify({
            accessToken,
            refreshToken,
        })
        await server.redis.setex(`loginAccess:${user.id}`, 86400, tokenizer);

        return reply.send({ accessToken, refreshToken });


    } catch (error) {
        console.error(error)
        return reply.status(500).send({ message: "Terjadi kesalahan" })
    }
}