import { FastifyInstance } from "fastify";
import userRoutes from  "../modules/v1/user/user.route";
import tournamentRoutes from "../modules/v1/tournaments/tournaments.route";
import contestantRoute from "../modules/v1/contestant/contestant.route";
import eventRoute from "src/modules/v1/event/event.route";
import webRoute from "src/modules/v1/web/web.route";
import { SessionRoutes } from "src/modules/v1/session/session.route";
import { AccountRoute } from "src/modules/v1/account/account.route";

export class AppRoutes {
    static register(fastify: FastifyInstance) {
        // Old Route
        fastify.register(userRoutes, { prefix: "/api/v1/user" });
        fastify.register(tournamentRoutes, { prefix: "/api/v1/tournaments" });
        fastify.register(contestantRoute, { prefix: "/api/v1/contestants" });
        fastify.register(eventRoute, { prefix: "/api/v1/events" });
        fastify.register(webRoute, { prefix: "/api/v1/web" });
        // New route
        fastify.register((app) => SessionRoutes.register(app), {prefix: '/api/v1/session'})
        fastify.register((app) => AccountRoute.register(app), {prefix: '/api/v1/account'})
    }
}
