import { FastifyInstance } from "fastify";
import { createContestant, deleteContestant, exportDataTournamentHandler, getAllContestants, getContestant, updateContestant } from "./contestant.controller";

async function contestantRoute(server: FastifyInstance) {
    server.get('/:tournament', {
        preHandler: [server.authenticate]
    }, getAllContestants);

    server.post('/:tournament', {
        preHandler: [server.authenticate]
    }, createContestant);

    server.put('/:contestantId', {
        preHandler: [server.authenticate]
    }, updateContestant);

    server.get('/user/:tournament', {
        preHandler: [server.authenticate]
    }, getContestant);

    server.delete('/:contestant', {
        preHandler: [server.authenticate]
    }, deleteContestant);

    server.get('/export/:id/:bool',exportDataTournamentHandler)

}

export default contestantRoute;