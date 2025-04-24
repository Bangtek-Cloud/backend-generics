import { FastifyInstance } from "fastify";
import {
    createWebsiteHandler,
    getAllWebsiteSectionsHandler,
    getAllWebsiteRouteHandler,
    createWebsiteRouteHandler,
    updateWebsiteRouteHandler,
    deleteWebsiteRouteHandler,
    getWebsiteRouteByIdHandler,
    deleteWebsiteSectionHandler,
    getWebsiteSectionByIdHandler,
    updateWebsiteHandler,
    getWebsiteSectionByRouteIdHandler
} from "./web.controller";

async function webRoute(server: FastifyInstance) {
    server.get('/', getAllWebsiteSectionsHandler);
    server.get('/:id',getWebsiteSectionByIdHandler);
    server.put('/:id', {
        preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
    }, updateWebsiteHandler);
    server.get('/url/:path', getWebsiteSectionByRouteIdHandler);
    server.post('/',{
        preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
    }, createWebsiteHandler);
    server.delete('/:id', {
        preHandler: [server.authenticate, server.authorize(["SU", "ADMIN"])],
    }, deleteWebsiteSectionHandler);
    
    server.get('/route',  getAllWebsiteRouteHandler);
    server.get('/route/:id', getWebsiteRouteByIdHandler);
    server.post('/route', {
        preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
    }, createWebsiteRouteHandler);
    server.put('/route/:id', {
        preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
    }, updateWebsiteRouteHandler);
    server.delete('/route/:id', {
        preHandler: [server.authenticate, server.authorize(["ADMIN", "SU"])],
    }, deleteWebsiteRouteHandler);
}

export default webRoute;