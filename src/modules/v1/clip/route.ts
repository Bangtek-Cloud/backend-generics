import { FastifyInstance } from "fastify";
import { ClipController } from "./controller";

export class ClipRoutes {
    static register(fastify: FastifyInstance) {
        fastify.post(
            "",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["EDITOR", "ADMIN", "SU"]),
                ],
            },
            ClipController.create
        );

        fastify.get("", ClipController.getAll);
        fastify.get("/:id", ClipController.getById);

        fastify.put(
            "/:id",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["EDITOR", "ADMIN", "SU"]),
                ],
            },
            ClipController.update
        );

        fastify.delete(
            "/:id",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["EDITOR", "ADMIN", "SU"]),
                ],
            },
            ClipController.delete
        );
    }
}
