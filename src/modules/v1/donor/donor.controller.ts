import { FastifyRequest, FastifyReply } from 'fastify'
import { DonorService } from './donor.service'

export const DonorController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const donors = await new DonorService().list()
    reply.send(donors)
  },

  async create(req: FastifyRequest, reply: FastifyReply) {
    const donor = await new DonorService().create(req.body)
    reply.send(donor)
  },

  async createDonation(req: FastifyRequest, reply: FastifyReply) {
    const donation = await new DonorService().createDonation(req.body)
    reply.send(donation)
  },

  async getDonations(req: FastifyRequest, reply: FastifyReply) {
    const { eventId } = req.params as any
    const donations = await new DonorService().getDonationsByEvent(eventId)
    reply.send(donations)
  }
}
