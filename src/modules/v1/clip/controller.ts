import { FastifyReply, FastifyRequest } from "fastify";
import { ClipService } from "./service";

export class ClipController {
    static async create(
        request: FastifyRequest<{
            Body: {
                url: string;
                caption?: string;
            };
        }>,
        reply: FastifyReply
    ) {
        const { url, caption } = request.body;

        if (!url) {
            return reply.status(400).send({
                success: false,
                message: "URL wajib diisi",
            });
        }

        const data = await ClipService.create({
            url,
            caption,
        });

        return reply.status(201).send({
            success: true,
            data,
        });
    }

    static async getAll(
        request: FastifyRequest<{
            Querystring: {
                page?: number;
                limit?: number;
                search?: string;
            };
        }>,
        reply: FastifyReply
    ) {
        const page = Number(request.query.page ?? 1);
        const limit = Number(request.query.limit ?? 10);
        const search = request.query.search;

        const result = await ClipService.getAll({ page, limit, search });

        return reply.send({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    }

    static async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const data = await ClipService.getById(request.params.id);

        if (!data) {
            return reply.status(404).send({
                success: false,
                message: "Clip tidak ditemukan",
            });
        }

        return reply.send({
            success: true,
            data,
        });
    }

    static async update(
        request: FastifyRequest<{
            Params: { id: string };
            Body: {
                url?: string;
                caption?: string;
            };
        }>,
        reply: FastifyReply
    ) {
        const { id } = request.params;
        const existing = await ClipService.getById(id);

        if (!existing) {
            return reply.status(404).send({
                success: false,
                message: "Clip tidak ditemukan",
            });
        }

        const updated = await ClipService.update(id, request.body);

        return reply.send({
            success: true,
            data: updated,
        });
    }

    static async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        await ClipService.delete(request.params.id);
        return reply.send({
            success: true,
            message: "Clip berhasil dihapus",
        });
    }
}
