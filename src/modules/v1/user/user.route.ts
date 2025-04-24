import { FastifyInstance } from "fastify";
import {
    registerHandler,
    loginHandler,
    meHandler,
    updateHandler,
    refreshHandler,
    getAllHandler,
    updatePasswordHandler,
    forceUpdatePasswordHandler,
    getUserByIdHandler,
    forceUpdateHandler,
    changeUserToAdmin
} from "./user.controller";
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

    server.get('/all-user', { preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])] }, getAllHandler)

    server.put('/updateMe', {
        preHandler: [server.authenticate]
    }, updateHandler)

    server.put('/update-password', {
        preHandler: [server.authenticate]
    }, updatePasswordHandler)

    server.put('/force-update-password', {
        preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])]
    }, forceUpdatePasswordHandler)

    server.get('/:id', { preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])] }, getUserByIdHandler)
    server.put('/force-update/:id', { preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])] }, forceUpdateHandler)

    server.post('/changerole', { preHandler: [server.authenticate, server.authorize(["SU"])] }, changeUserToAdmin)
}

export default userRoutes;
