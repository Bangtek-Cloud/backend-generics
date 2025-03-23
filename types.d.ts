import "@fastify/jwt";
import "fastify";

declare module '@fastify/jwt' {
    export interface FastifyJWT {
        user: {
            id: string;
            email: string;
            name: string;
            avatar: string;
            publicMeta: {
                role: string
            }
        };
    }
}

declare module 'fastify' {
    export interface FastifyInstance {
        authenticate: any;
    }
}