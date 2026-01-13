import { FastifyInstance } from "fastify";
import { ArticleController } from "./controller";

export class ArticleRoutes {
    static register(fastify: FastifyInstance) {
        fastify.post(
            "",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["EDITOR", "ADMIN", "SU"]),
                ],
            },
            ArticleController.create
        );

        fastify.get("", ArticleController.getAll);
        fastify.get("/:id", ArticleController.getById);

        fastify.put(
            "/:id",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["EDITOR", "ADMIN", "SU"]),
                ],
            },
            ArticleController.update
        );

        fastify.delete(
            "/:id",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["EDITOR", "ADMIN", "SU"]),
                ],
            },
            ArticleController.delete
        );
    }
}
