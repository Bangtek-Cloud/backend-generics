import { FastifyInstance } from "fastify";
import { createBankHandler, deleteBankHandler, getAllBankHandler, getBankByIdHandler, updateBankHandler } from "./bank.controller";

export class BankRoute {
    static register(fastify: FastifyInstance) {
        fastify.get('/',
            {
                preHandler: [fastify.authenticate],
            },
            getAllBankHandler);
        fastify.get('/:id',
            {
                preHandler: [fastify.authenticate],
            },
            getBankByIdHandler);
        fastify.post('/',
            {
                preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])],
            },
            createBankHandler);
        fastify.put('/:id',
            {
                preHandler: [fastify.authenticate, fastify.authorize(["ADMIN", "SU"])],
            },
            updateBankHandler);
        fastify.delete('/:id',
            {
                preHandler: [fastify.authenticate, fastify.authorize(["SU"])],
            },
            deleteBankHandler);
    }
}