import { FastifyInstance } from "fastify";
import { SessionController } from "./session.controller";

export class SessionRoutes {
    static register(fastify: FastifyInstance) {
        fastify.get("/", SessionController.getAll);
        fastify.delete("/:id", SessionController.removeSession)
    }
}
