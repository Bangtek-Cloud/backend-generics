import { FastifyInstance } from "fastify";
import { SessionController } from "./session.controller";

export class SessionRoutes {
    static register(fastify: FastifyInstance) {
        fastify.get("/", {preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])]}, SessionController.getAll);
        fastify.delete("/:id",{preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])]}, SessionController.removeSession)
    }
}
