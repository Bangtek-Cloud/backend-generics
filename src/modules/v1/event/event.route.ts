import { FastifyInstance } from "fastify";
import { createEventHandler, deleteEventHandler, getAllEventsHandler, getEventByIdHandler, updateEventHandler } from "./event.controller";

async function eventRoute(server: FastifyInstance) {
    server.get('/',
        // !! TODO: REMOVE
        // {
        //     preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        // },
        getAllEventsHandler);
    server.get('/:id',
        // !! TODO: REMOVE
        // {
        //     preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        // },
        getEventByIdHandler);
    server.post('/',
        // !! TODO: REMOVE
        // {
        //     preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        // },
        createEventHandler);
    server.put('/:id',
        // !! TODO: REMOVE
        // {
        //     preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        // },
        updateEventHandler);
    server.delete('/:id',
        // !! TODO: REMOVE
        // {
        //     preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
        // },
        deleteEventHandler);
}

export default eventRoute;