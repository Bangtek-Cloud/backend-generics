import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler, meHandler, updateHandler, refreshHandler } from "./user.controller";
import { $ref } from "./user.schema";

async function userRoutes(server: FastifyInstance) {
    server.post("/register", {
        schema: {
            body: $ref("createUserSchema"),
            response: {
                201: $ref("loginResponseSchema"),
            },
        }
    }, registerHandler);

    server.post("/login", {
        schema: {
            body: $ref("loginSchema"),
            response: {
                200: $ref("loginResponseSchema"),
            },
        }
    }, loginHandler);

    server.get("/me", {
        schema: {
            response: {
                200: $ref('userMeResponse')
            }
        },
        preHandler: [server.authenticate]
    }, meHandler);

    server.post('/refresh', {
        schema: {
            body: $ref('refreshSchema')
        }
    }, refreshHandler)

    server.put('/updateMe', {
        schema: {
            body: $ref('updateSchema')
        },
        preHandler: [server.authenticate]
    }, updateHandler)

    //! Route dengan RBAC untuk admin
    //! server.get(
    //!     "/admin",
    //!    { preHandler: [server.authenticate, server.authorize(["ADMIN","USER"])] },
    //!    async (request, reply) => {
    //!        return { message: "Selamat datang di halaman admin!" };
    //!    }
    //! );
}

export default userRoutes;
