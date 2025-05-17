import { FastifyInstance } from 'fastify'
import { AssetController } from './asset.controller'

export class AssetRoute{
    static register(fastify: FastifyInstance) {
      fastify.get('/:eventId', AssetController.list)
      fastify.post('/', AssetController.create)
      fastify.put('/:id', AssetController.update)
      fastify.delete('/:id', AssetController.delete)
    }
}
