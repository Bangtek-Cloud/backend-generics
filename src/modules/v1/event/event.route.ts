import { FastifyInstance } from "fastify";
import { createEventHandler, deleteEventHandler, getAllEventsHandler, getEventByIdHandler, updateEventHandler } from "./event.controller";

async function eventRoute(server: FastifyInstance) {
    server.get('/',
        {
            preHandler: [server.authenticate],
        },
        getAllEventsHandler);
    server.get('/:id',
        {
            preHandler: [server.authenticate],
        },
        getEventByIdHandler);
    server.post('/',
        {
            preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        },
        createEventHandler);
    server.put('/:id',
        {
            preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        },
        updateEventHandler);
    server.delete('/:id',
        {
            preHandler: [server.authenticate, server.authorize(["SU"])],
        },
        deleteEventHandler);
}

export default eventRoute;