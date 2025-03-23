import { FastifyInstance } from "fastify";
import { registerHandler, loginHandler, meHandler } from "./user.controller";
import { $ref } from "./user.schema";

async function userRoutes(server: FastifyInstance) {
    server.post("/register", {
        schema: {
            body: $ref("createUserSchema"),
            response: {
                201: $ref("createUserResponseSchema"),
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
    },loginHandler);
    server.get("/me", { preHandler: [server.authenticate] }, meHandler);

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
