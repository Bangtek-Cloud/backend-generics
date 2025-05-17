import { FastifyRequest, FastifyReply } from 'fastify'
import { AssetService } from './asset.service'

export const AssetController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const { eventId } = req.params as any
    const assets = await new AssetService().getAll(eventId)
    reply.send(assets)
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const asset = await new AssetService().create(req.body)
    reply.send(asset)
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any
    const asset = await new AssetService().update(id, req.body)
    reply.send(asset)
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any
    await new AssetService().delete(id)
    reply.send({ message: 'Asset deleted' })
  }
}
