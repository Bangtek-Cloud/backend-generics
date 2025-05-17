import { FastifyRequest, FastifyReply } from 'fastify'
import { TransactionService } from './transaction.service'

export const TransactionController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const transactions = await new TransactionService().getAll()
    reply.send(transactions)
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const transaction = await new TransactionService().create(req.body)
    reply.send(transaction)
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any
    const transaction = await new TransactionService().update(id, req.body)
    reply.send(transaction)
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any
    await new TransactionService().delete(id)
    reply.send({ message: 'Transaction deleted' })
  }
}
