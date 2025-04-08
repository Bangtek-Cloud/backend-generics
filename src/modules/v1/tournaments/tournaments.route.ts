import { FastifyInstance } from "fastify";
import { addNewTournamentHandler, deleteTournamentHandler, getAllPendingTournamentsHandler, getAllTournamentByUserIdHandler, getAllTournamentsHandler, getTournamentByIdHandler, updateTournamentHandler, validatePriceHandler } from "./tournaments.controller";


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

    server.get('/pending', {
        preHandler: [server.authenticate],
    },
        getAllPendingTournamentsHandler);

    server.get('/all', {
        preHandler: [server.authenticate],
    },
        getAllTournamentByUserIdHandler);

    // server.get('/user/:id', {
    //     preHandler: [server.authenticate],
    //     getAllParticipansHandler
    // })
}

export default tournamentRoutes;