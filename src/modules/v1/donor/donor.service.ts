import prisma from 'src/utils/prisma'

export class DonorService {
  async list() {
    return prisma.donor.findMany({
      include: { donations: true }
    })
  }

  async create(data: any) {
    return prisma.donor.create({ data })
  }

  async createDonation(data: any) {
    return prisma.donation.create({ data })
  }

  async getDonationsByEvent(eventId: string) {
    return prisma.donation.findMany({ where: { eventId }, include: { donor: true } })
  }
}
