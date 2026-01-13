import { FastifyInstance } from "fastify";
import { HeroController } from "./controller";

export class HeroRoutes {
    static register(fastify: FastifyInstance) {
        fastify.get("", HeroController.get);

        fastify.post(
            "",
            {
                preHandler: [
                    fastify.authenticate,
                    fastify.authorize(["ADMIN", "SU"]),
                ],
            },
            HeroController.upsert
        );
    }
}
