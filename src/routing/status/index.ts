import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

export default fp(async (server: FastifyInstance, opts: FastifyPluginOptions) => {
  server.route({
    url: "/status",
    logLevel: "warn",
    method: ["GET", "HEAD"],
    handler: async (request, reply) => {
      return reply.send({ date: new Date(), works: true });
    }
  });
});