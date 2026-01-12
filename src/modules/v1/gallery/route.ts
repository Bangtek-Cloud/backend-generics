import { FastifyInstance } from "fastify";
import { GalleryController } from "./controller";

export class GalleryRoutes {
    static register(fastify: FastifyInstance) {
        fastify.post("",
            {
                preHandler: [fastify.authenticate, fastify.authorize(["EDITOR", "ADMIN", "SU"])],
            },
            GalleryController.create);
        fastify.get("", GalleryController.getAll);
        fastify.get("/:id", GalleryController.getById);
        fastify.put("/:id", {
            preHandler: [fastify.authenticate, fastify.authorize(["EDITOR", "ADMIN", "SU"])],
        }, GalleryController.update);
        fastify.delete("/:id", {
            preHandler: [fastify.authenticate, fastify.authorize(["EDITOR", "ADMIN", "SU"])],
        }, GalleryController.delete);
    }
}