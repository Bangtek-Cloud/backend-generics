import prisma from 'src/utils/prisma'

export class AssetService {
  async getAll(eventId: string) {
    return prisma.asset.findMany({ where: { eventId } })
  }

  async create(data: any) {
    return prisma.asset.create({
      data
    })
  }

  async update(id: number, data: any) {
    return prisma.asset.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    return prisma.asset.delete({
      where: { id }
    })
  }
}
