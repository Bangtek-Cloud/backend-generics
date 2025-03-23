import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./modules/v1/user/user.route";
import { userSchemas } from "./modules/v1/user/user.schema";
import fjwt from "@fastify/jwt";

export const server = Fastify({
    logger: true,
});


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
        console.log('disnini')
        try {
            await request.jwtVerify();
            const userRole = request.user.publicMeta.role;
            console.info(userRole)

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

// Pastikan dekorator sudah terdaftar sebelum rute di-load
async function main() {
    for (const schema of userSchemas) {
        server.addSchema(schema);
    }

    // Register routes setelah middleware
    server.register(userRoutes, { prefix: "/api/v1/user" });

    try {
        await server.listen({ port: 3000, host: "0.0.0.0" });
        console.info("Server running on http://localhost:3000");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
