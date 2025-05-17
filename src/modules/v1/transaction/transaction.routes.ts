import { FastifyInstance } from 'fastify'
import { TransactionController } from './transaction.controller'

export class TransactionRoute {
    static register(fastify: FastifyInstance) {
        fastify.get('/', TransactionController.list)
        fastify.post('/', TransactionController.create)
        fastify.put('/:id', TransactionController.update)
        fastify.delete('/:id', TransactionController.delete)
    }
}
