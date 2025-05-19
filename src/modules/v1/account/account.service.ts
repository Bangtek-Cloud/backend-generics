import { Account } from "@prisma/client"
import prisma from "src/utils/prisma"

export class AccountService {
    static async getAll(
        page: number,
        perPage: number,
        eventId?: string
    ): Promise<{
        accounts: Account[],
        total: number,
        totalPage: number,
        totalPerPage: number,
        totalCredit: number,
        totalDebit: number,
        balance: number
    }> {
        const whereClause = eventId ? { eventId } : {};

        const accounts = await prisma.account.findMany({
            where: whereClause,
            skip: (page - 1) * perPage,
            take: perPage
        });

        const total = await prisma.account.count({
            where: whereClause
        });

        const creditAggregate = await prisma.account.aggregate({
            _sum: {
                amount: true
            },
            where: {
                ...whereClause,
                status: 'CREDIT'
            }
        });

        const debitAggregate = await prisma.account.aggregate({
            _sum: {
                amount: true
            },
            where: {
                ...whereClause,
                status: 'DEBIT'
            }
        });

        const totalCredit = creditAggregate._sum.amount || 0;
        const totalDebit = debitAggregate._sum.amount || 0;
        const totalPage = Math.ceil(total / perPage);
        const balance = totalCredit - totalDebit;
        const totalPerPage = accounts.length;

        return {
            accounts,
            total,
            totalPage,
            totalPerPage,
            totalCredit,
            totalDebit,
            balance
        };
    }

    static async new(data: {
        detail: string
        amount: number
        status: "CREDIT" | "DEBIT"
        note: string
        date: Date
        eventId: string
    }): Promise<Account | string> {
        try {
            const newAccount = await prisma.account.create({
                data: {
                    detail: data.detail,
                    amount: data.amount,
                    status: data.status,
                    note: data.note,
                    date: data.date,
                    eventId: data.eventId
                },
            });
            return newAccount;
        } catch (error) {
            if (error.code && error.meta) {
                return `Gagal membuat account: [${error.code}] ${error.meta.cause || error.message}`;
            }
            return "Terjadi kesalahan"
        }
    }

    static async update(id: string, data: {
        detail: string
        amount: number
        status: "CREDIT" | "DEBIT"
        note: string
        date: Date
    }): Promise<Account> {
        try {
            const newAccount = await prisma.account.update({
                where: {
                    id: id
                },
                data: {
                    detail: data.detail,
                    amount: data.amount,
                    status: data.status,
                    note: data.note,
                    date: data.date
                },
            });
            return newAccount;
        } catch (error) {
            if (error.code && error.meta) {
                throw new Error(`Gagal membuat account: [${error.code}] ${error.meta.cause || error.message}`);
            }
            throw error;
        }
    }

    static async delete(id: string): Promise<Account> {
        try {
            const newAccount = await prisma.account.delete({
                where: {
                    id: id
                },
            });
            return newAccount;
        } catch (error) {
            if (error.code && error.meta) {
                throw new Error(`Gagal membuat account: [${error.code}] ${error.meta.cause || error.message}`);
            }
            throw error;
        }
    }
}