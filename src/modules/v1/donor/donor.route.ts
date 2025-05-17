import { FastifyInstance } from 'fastify'
import { DonorController } from './donor.controller'


export class DonorRoutes{
    static register(fastify: FastifyInstance){
        fastify.get('/', DonorController.list)
        fastify.post('/', DonorController.create)
        fastify.post('/donations', DonorController.createDonation)
        fastify.get('/donations/:eventId', DonorController.getDonations)
    }
}
