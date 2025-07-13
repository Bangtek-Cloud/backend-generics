import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./modules/v1/user/user.route";
import { userSchemas } from "./modules/v1/user/user.schema";
import fjwt from "@fastify/jwt";
import * as pack from '../package.json'
import fastifyRedis from "@fastify/redis";
import fastifyEnv from '@fastify/env'
import { JWTPayload } from "./types";
import cors from '@fastify/cors'
import tournamentRoutes from "./modules/v1/tournaments/tournaments.route";
import contestantRoute from "./modules/v1/contestant/contestant.route";
import fastifyMultipart from "@fastify/multipart";
import eventRoute from "./modules/v1/event/event.route";
import webRoute from "./modules/v1/web/web.route";
import { SessionServices } from "./modules/v1/session/session.service";
import { AppRoutes } from "./routing";

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
    required: [
        "JWT_SECRET",
        'MINIO_ENDPOINT',
        'MINIO_PORT',
        'MINIO_USE_SSL',
        'MINIO_ACCESS_KEY',
        'MINIO_SECRET_KEY',
        'S3_URL',
    ],
    properties: {
        JWT_SECRET: { type: "string" },
        MINIO_ENDPOINT: { type: 'string' },
        MINIO_PORT: { type: 'string' },
        MINIO_USE_SSL: { type: 'string' },
        MINIO_ACCESS_KEY: { type: 'string' },
        MINIO_SECRET_KEY: { type: 'string' },
        S3_URL: { type: 'string' },
    },
};

const options = {
    confKey: 'config',
    schema: schema,
    data: process.env
}
server.register(fastifyEnv, options)

server.register(fastifyMultipart ,{
    limits: {
        fieldNameSize: 1000,
        fieldSize: 10000000,
        fileSize: 30 * 1024 * 1024
    }
});

server.register(fjwt, { secret: process.env.JWT_SECRET });
server.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const header = request.headers.authorization;
      if (!header || !header.startsWith("Bearer ")) {
        return reply.code(401).send({
          code: 401,
          error: "Token tidak ditemukan atau format salah.",
        });
      }
  
      const token = header.split(" ")[1];
  
      let decoded: JWTPayload;
      try {
        decoded = await request.jwtVerify<JWTPayload>();
      } catch (e: any) {
        if (e.name === "TokenExpiredError") {
          return reply.code(401).send({
            code: 401,
            error: "Token telah kedaluwarsa.",
          });
        }
        return reply.code(401).send({
          code: 401,
          error: "Token tidak valid.",
        });
      }
  
      const sessionStore = await SessionServices.findByUid(decoded.id)
  
      if (!sessionStore) {
        return reply.code(440).send({
          code: 440,
          error: "Akses ditolak. Token tidak ditemukan di server.",
        });
      }
  
      if (sessionStore.token !== token) {
        return reply.code(440).send({
          code: 440,
          error: "Sesi tidak valid atau Anda telah login di perangkat lain.",
        });
      }
  
      // Jika semua valid, lanjut
    } catch (e) {
      console.error("Internal auth error", e);
      return reply.code(500).send({
        code: 500,
        error: "Terjadi kesalahan saat otentikasi.",
      });
    }
  });
  

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

async function setupServer() {
    for (const schema of [...userSchemas]) {
        server.addSchema(schema);
    }
    server.get('/', async () => ({
        name: `${pack.name} API Service`,
        version: pack.version
    }))
    server.get("/health", async () => ({ status: "ok" }));

    AppRoutes.register(server)

    await server.ready();
}

setupServer();

export default server;
