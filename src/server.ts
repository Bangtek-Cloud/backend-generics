import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./modules/v1/user/user.route";
import { userSchemas } from "./modules/v1/user/user.schema";
import fjwt from "@fastify/jwt";
import * as pack from '../package.json'
import Redis from "ioredis";
import fastifyRedis from "@fastify/redis";
import fastifyEnv from '@fastify/env'
import { JWTPayload } from "./types";
import cors from '@fastify/cors'

export const server = Fastify({ logger: true });

server.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    credentials: true,
});

const schema = {
    type: "object",
    required: ["HELLO","JWT_SECRET", "REDIS_HOST", "REDIS_PORT", "REDIS_USER", "REDIS_PASS"],
    properties: {
        HELLO: { type: "string" },
        JWT_SECRET: { type: "string" },
        REDIS_HOST: { type: "string" },
        REDIS_PORT: { type: "number" },
        REDIS_USER: { type: "string" },
        REDIS_PASS: { type: "string" },
    },
};

const options = {
    confKey: 'config',
    schema: schema,
    data: process.env
}

server.register(fastifyEnv, options)

console.log()
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS
});


server.register(fastifyRedis, {
    client: redis,
    closeClient: true
});

server.register(fjwt, { secret: process.env.JWT_SECRET });

server.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
        const header = request.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return reply.code(401).send({
                code: 401,
                error: "Token tidak ditemukan atau tidak valid. Silakan login kembali.",
            });
        }

        const token = header.split(" ")[1];
        const decoded = await request.jwtVerify<JWTPayload>();

        const redisAccessToken = await redis.get(`loginAccess:${decoded.id}`);

        if (!redisAccessToken) {
            return reply.code(403).send({
                code: 403,
                error: "Akses ditolak. Token tidak ditemukan di server.",
            });
        }
        const redisParse = JSON.parse(redisAccessToken);

        if (redisParse.accessToken !== token) {
            return reply.code(403).send({
                code: 403,
                error: "Sesi tidak valid atau Anda telah login di perangkat lain. Silakan login kembali.",
            });
        }

        // Jika semua valid, lanjutkan ke route selanjutnya
    } catch (e) {
        return reply.code(401).send({
            code: 401,
            error: "Token tidak valid atau telah kedaluwarsa. Silakan login kembali.",
        });
    }
});


// Middleware untuk otorisasi RBAC
server.decorate("authorize", (roles: string[]) => {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
            const userRole = request.user.publicMeta.role;

            if (!roles.includes(userRole)) {
                return reply.code(403).send({
                    code: 403,
                    error: "Akses ditolak. Anda tidak memiliki izin untuk mengakses sumber daya ini.",
                });
            }
        } catch (e) {
            request.log.error(e);
            return reply.code(401).send({
                code: 401,
                error: "Anda tidak memiliki izin untuk mengakses sumber daya ini.",
            });
        }
    };
});


// Register schema & routes
async function setupServer() {
    for (const schema of userSchemas) {
        server.addSchema(schema);
    }
    server.get('/', async () => ({
        name: `${pack.name} API Service --- ${process.env.HELLO}`,
        version: pack.version
    }))
    server.get("/health", async () => ({ status: "ok" }));

    server.register(userRoutes, { prefix: "/api/v1/user" });

    await server.ready();
}

setupServer();

export default server;
