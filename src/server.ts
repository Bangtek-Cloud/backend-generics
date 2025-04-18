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
import tournamentRoutes from "./modules/v1/tournaments/tournaments.route";
import contestantRoute from "./modules/v1/contestant/contestant.route";
import fastifyMultipart from "@fastify/multipart";
import eventRoute from "./modules/v1/event/event.route";

export const server = Fastify({ logger: true });

console.info("Install CORS");
server.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    credentials: true,
});
console.info("CORS installed");
console.info('Install Env');
const schema = {
    type: "object",
    required: [
        "JWT_SECRET",
        "REDIS_HOST",
        "REDIS_PORT",
        "REDIS_USER",
        "REDIS_PASS",
        'MINIO_ENDPOINT',
        'MINIO_PORT',
        'MINIO_USE_SSL',
        'MINIO_ACCESS_KEY',
        'MINIO_SECRET_KEY',
    ],
    properties: {
        JWT_SECRET: { type: "string" },
        REDIS_HOST: { type: "string" },
        REDIS_PORT: { type: "number" },
        REDIS_USER: { type: "string" },
        REDIS_PASS: { type: "string" },
        MINIO_ENDPOINT: { type: 'string' },
        MINIO_PORT: { type: 'string' },
        MINIO_USE_SSL: { type: 'string' },
        MINIO_ACCESS_KEY: { type: 'string' },
        MINIO_SECRET_KEY: { type: 'string' },
    },
};

const options = {
    confKey: 'config',
    schema: schema,
    data: process.env
}
server.register(fastifyEnv, options)
console.info("Env installed");
console.info("Install Multipart");
server.register(fastifyMultipart ,{
    limits: {
        fieldNameSize: 1000,
        fieldSize: 10000000,
        fileSize: 30 * 1024 * 1024
    }
});
console.info("Multipart installed");
console.info("Install Redis");

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);  // Meningkatkan waktu retry
        return delay;
    }
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
            return reply.code(440).send({
                code: 440,
                error: "Token tidak ditemukan atau tidak valid. Silakan login kembali.",
            });
        }

        const token = header.split(" ")[1];
        const decoded = await request.jwtVerify<JWTPayload>();

        const redisAccessToken = await redis.get(`loginAccess:${decoded.id}`);

        if (!redisAccessToken) {
            return reply.code(440).send({
                code: 440,
                error: "Akses ditolak. Token tidak ditemukan di server.",
            });
        }
        const redisParse = JSON.parse(redisAccessToken);

        if (redisParse.accessToken !== token) {
            return reply.code(440).send({
                code: 440,
                error: "Sesi tidak valid atau Anda telah login di perangkat lain. Silakan login kembali.",
            });
        }

        // Jika semua valid, lanjutkan ke route selanjutnya
    } catch (e) {
        return reply.code(440).send({
            code: 440,
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
            return reply.code(403).send({
                code: 403,
                error: "Anda tidak memiliki izin untuk mengakses sumber daya ini.",
            });
        }
    };
});


// Register schema & routes
async function setupServer() {
    for (const schema of [...userSchemas]) {
        server.addSchema(schema);
    }
    server.get('/', async () => ({
        name: `${pack.name} API Service`,
        version: pack.version
    }))
    server.get("/health", async () => ({ status: "ok" }));

    server.register(userRoutes, { prefix: "/api/v1/user" });
    server.register(tournamentRoutes, { prefix: "/api/v1/tournaments" });
    server.register(contestantRoute, { prefix: "/api/v1/contestants" });
    server.register(eventRoute, { prefix: "/api/v1/events" });

    await server.ready();
}

setupServer();

export default server;
