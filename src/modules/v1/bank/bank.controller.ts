import { FastifyRequest, FastifyReply } from "fastify";
import { BankService } from "./bank.service";

export async function createBankHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { BankName, BankType, BankNo, noHp } = request.body as {
      BankName: string;
      BankType: string;
      BankNo: string;
      noHp: string;
    };

    if (!BankName || !BankType || !BankNo || !noHp) {
      return reply.status(400).send({
        success: false,
        message: "Semua field harus diisi",
      });
    }

    const created = await BankService.create({ BankName, BankType, BankNo, noHp });

    return reply.status(201).send({
      success: true,
      message: "Data bank berhasil dibuat",
      data: created,
    });
  } catch (error) {
    console.error("Error creating bank:", error);
    return reply.status(500).send({
      success: false,
      message: "Terjadi kesalahan saat membuat data bank",
    });
  }
}

export async function getAllBankHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await BankService.findAll();
    return reply.status(200).send({ success: true, data });
  } catch (error) {
    console.error("Error fetching banks:", error);
    return reply.status(500).send({
      success: false,
      message: "Terjadi kesalahan saat mengambil data bank",
    });
  }
}

export async function getBankByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  try {
    const bank = await BankService.getById(id);
    if (!bank) {
      return reply.status(404).send({ success: false, message: "Data bank tidak ditemukan" });
    }

    return reply.status(200).send({ success: true, data: bank });
  } catch (error) {
    console.error("Error fetching bank by ID:", error);
    return reply.status(500).send({
      success: false,
      message: "Terjadi kesalahan saat mengambil data bank",
    });
  }
}

export async function updateBankHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  try {
    const updated = await BankService.update(id, request.body as any);
    return reply.status(200).send({
      success: true,
      message: "Data bank berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating bank:", error);
    return reply.status(500).send({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data bank",
    });
  }
}

export async function deleteBankHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  try {
    const deleted = await BankService.delete(id);
    return reply.status(200).send({
      success: true,
      message: "Data bank berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting bank:", error);
    return reply.status(500).send({
      success: false,
      message: "Terjadi kesalahan saat menghapus data bank",
    });
  }
}
