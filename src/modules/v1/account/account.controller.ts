import { FastifyReply, FastifyRequest } from "fastify";
import { AccountService } from "./account.service";

export class AccountController {
    static async getAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { page = 1, perPage = 10, eventId } = request.query as {
                page?: string | number;
                perPage?: string | number;
                eventId?: string;
            };

            const numericPage = Number(page) || 1;
            const numericPerPage = Number(perPage) || 10;

            const accounts = await AccountService.getAll(numericPage, numericPerPage, eventId);
            return reply.status(200).send({ success: true, data: accounts });
        } catch (error) {
            return reply.status(500).send({ success: false, message: (error as Error).message });
        }
    }

    static async new(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { detail, amount, status, note, date, eventId } = request.body as { detail: string, amount: number, eventId: string, status: "CREDIT" | "DEBIT", note: string, date: Date };
            const newAccount = await AccountService.new({ detail, amount, status, note, date, eventId });
            return reply.status(200).send({ success: true, data: newAccount });
        } catch (error) {
            return reply.status(500).send({ success: false, message: (error as Error).message });
        }
    }

    static async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const { detail, amount, status, note, date } = request.body as { detail: string, amount: number, status: "CREDIT" | "DEBIT", note: string, date: Date };
            const updatedAccount = await AccountService.update(id, { detail, amount, status, note, date });
            return reply.status(200).send({ success: true, data: updatedAccount });
        } catch (error) {
            return reply.status(500).send({ success: false, message: (error as Error).message });
        }
    }

    static async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const deletedAccount = await AccountService.delete(id);
            return reply.status(200).send({ success: true, data: deletedAccount });
        } catch (error) {
            return reply.status(500).send({ success: false, message: (error as Error).message });
        }
    }
}