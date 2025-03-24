import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./modules/v1/user/user.route";
import { userSchemas } from "./modules/v1/user/user.schema";
import fjwt from "@fastify/jwt";

export const server = Fastify({ logger: true });

server.register(fjwt, { secret: "ini secret" });

// Middleware untuk otentikasi
server.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (e) {
        return reply.code(401).send({
            code: 401,
            error: "Anda tidak memiliki izin untuk mengakses sumber daya ini. Silakan login terlebih dahulu.",
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

    server.register(userRoutes, { prefix: "/api/v1/user" });

    await server.ready();
}

setupServer();

export default server;
