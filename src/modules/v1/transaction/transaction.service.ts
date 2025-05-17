import prisma from "src/utils/prisma";

export class TransactionService {
  getAll() {
    return prisma.transaction.findMany({
      include: {
        journal: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  getByEvent(eventId: string) {
    return prisma.transaction.findMany({
      where: { eventId },
      include: { journal: { include: { account: true } } },
    });
  }

  getById(id: number) {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        journal: {
          include: { account: true },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.transaction.create({
      data: {
        date: data.date,
        description: data.description,
        eventId: data.eventId,
        journal: {
          create: data.journal, // array of { accountId, debit, credit }
        },
      },
    });
  }

  async update(id: number, data: any) {
    // Hapus jurnal lama dulu
    await prisma.journal.deleteMany({
      where: { transactionId: id },
    });

    // Update transaksi dan jurnal baru
    return prisma.transaction.update({
      where: { id },
      data: {
        date: data.date,
        description: data.description,
        eventId: data.eventId,
        journal: {
          create: data.journal, // array baru dari jurnal
        },
      },
      include: {
        journal: true,
      },
    });
  }

  async delete(id: number) {
    // Hapus jurnal terlebih dahulu
    await prisma.journal.deleteMany({
      where: { transactionId: id },
    });

    // Hapus transaksi
    return prisma.transaction.delete({
      where: { id },
    });
  }
}
