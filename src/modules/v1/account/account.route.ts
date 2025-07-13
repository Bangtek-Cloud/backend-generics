import { FastifyInstance } from "fastify";
import { AccountController } from "./account.controller";

export class AccountRoute {
   static register(fastify: FastifyInstance) {
        fastify.get("/", AccountController.getAll);
        fastify.post("/",{preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])]}, AccountController.new);
        fastify.put("/:id",{preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])]}, AccountController.update);
        fastify.delete("/:id",{preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])]}, AccountController.delete);
    }
}