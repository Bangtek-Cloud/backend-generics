export interface JWTPayload {
    id: string
}

declare module "fastify" {
    interface FastifyInstance {
        authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
    }
}