import { Bank } from "@prisma/client";
import prisma from "src/utils/prisma";

export class BankService {
    static async findAll(): Promise<Bank[]> {
        try {
            const bank = await prisma.bank.findMany();
            return bank;
        } catch (error) {
            if (error.code && error.meta) {
                throw new Error(`Gagal menemukan bank: [${error.code}] ${error.meta.cause || error.message}`);
            }
            throw new Error(`Gagal menemukan bank: ${error.message || "Terjadi kesalahan tak dikenal"}`);
        }
    }

    static async create(data: {
        BankName: string;
        BankType: string;
        BankNo: string;
        noHp: string;
    }): Promise<Bank> {
        const c = await prisma.bank.create({ data });
        return c;
    }

    static async getById(id: string): Promise<Bank | null> {
        const bank = await prisma.bank.findUnique({
            where: { id },
        });
        return bank;
    }

    static async update(id: string, data: Partial<{
        BankName: string;
        BankType: string;
        BankNo: string;
        noHp: string;
        eventId: string;
    }>): Promise<Bank> {
        try {
            const updated = await prisma.bank.update({
                where: { id },
                data,
            });
            return updated;
        } catch (error) {
            throw new Error(`Gagal memperbarui data bank: ${error.message}`);
        }
    }

    static async delete(id: string): Promise<Bank> {
        try {
            const deleted = await prisma.bank.delete({
                where: { id },
            });
            return deleted;
        } catch (error) {
            throw new Error(`Gagal menghapus data bank: ${error.message}`);
        }
    }
}
