import { FastifyInstance } from "fastify";
import { addNewTournamentHandler, deleteTournamentHandler, getAllTournamentsHandler, getTournamentByIdHandler, updateTournamentHandler } from "./tournaments.controller";

// Extend FastifyInstance to include the authorize method
declare module "fastify" {
    interface FastifyInstance {
        authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
    }
}

async function tournamentRoutes(server: FastifyInstance) {
    server.post(
        "/new",
        { preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])] },
        addNewTournamentHandler
    );
    server.get(
        "/",
        { preHandler: [server.authenticate] },
        getAllTournamentsHandler
    );
    server.get(
        "/:id",
        { preHandler: [server.authenticate] },
        getTournamentByIdHandler
    );
    server.put(
        "/:id",
        { preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])] },
        updateTournamentHandler
    );
    server.delete(
        "/:id",
        { preHandler: [server.authenticate, server.authorize(["SU"])] },
        deleteTournamentHandler
    );
}

export default tournamentRoutes;