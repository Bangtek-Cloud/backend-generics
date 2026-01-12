import { FastifyReply, FastifyRequest } from "fastify";
import { uploadFileToMinio } from "src/utils/minio-upload";
import { GalleryService } from "./service";

const BUCKET_NAME = "event-logo";

export class GalleryController {
    static async create(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const parts = request.parts();
            let imageBuffer: Buffer | undefined;
            let imageName = "";
            let caption: string;

            for await (const part of parts) {
                if (part.type === "file") {
                    const chunks: Buffer[] = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    imageBuffer = Buffer.concat(chunks);
                    imageName = part.filename || "";
                } else {
                    if (part.fieldname === "caption") {
                        caption = String(part.value);
                    }
                }
            }

            if (!imageBuffer) {
                return reply.status(400).send({
                    success: false,
                    message: "Image wajib diupload",
                });
            }

            const upload = await uploadFileToMinio({
                server: request.server,
                bucket: BUCKET_NAME,
                buffer: imageBuffer,
                originalName: imageName,
                prefix: "gallery",
            });

            const data = await GalleryService.create({
                image: upload.objectPath,
                caption: caption || "",
            });

            return reply.status(201).send({
                success: true,
                data,
            });
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({
                success: false,
                message: error.message,
            });
        }
    }

    static async getAll(
        request: FastifyRequest<{
            Querystring: { page?: number; limit?: number; search?: string };
        }>,
        reply: FastifyReply
    ) {
        const page = Number(request.query.page ?? 1);
        const limit = Number(request.query.limit ?? 10);
        const search = request.query.search;

        const result = await GalleryService.getAll({ page, limit, search });

        const mapped = result.data.map(item => ({
            ...item,
            image: item.image
                ? process.env.S3_URL + item.image
                : null,
        }));

        return reply.send({
            success: true,
            data: mapped,
            meta: result.meta,
        });
    }

    static async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const data = await GalleryService.getById(request.params.id);
        if (!data) {
            return reply.status(404).send({
                success: false,
                message: "Gallery tidak ditemukan",
            });
        }

        return reply.send({
            success: true,
            data: {
                ...data,
                image: data.image
                    ? process.env.S3_URL + data.image
                    : null,
            },
        });
    }

    static async update(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const { id } = request.params;
        const existing = await GalleryService.getById(id);

        if (!existing) {
            return reply.status(404).send({
                success: false,
                message: "Gallery tidak ditemukan",
            });
        }

        const parts = request.parts();
        let imageBuffer: Buffer | undefined;
        let imageName = "";
        let caption: string | undefined;

        for await (const part of parts) {
            if (part.type === "file") {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                imageBuffer = Buffer.concat(chunks);
                imageName = part.filename || "";
            } else {
                if (part.fieldname === "caption") {
                    caption = String(part.value);
                }
            }
        }

        let imagePath = existing.image;

        if (imageBuffer) {
            const upload = await uploadFileToMinio({
                server: request.server,
                bucket: BUCKET_NAME,
                buffer: imageBuffer,
                originalName: imageName,
                prefix: "gallery",
            });

            imagePath = upload.objectPath;
        }

        const updated = await GalleryService.update(id, {
            image: imagePath,
            caption,
        });

        return reply.send({
            success: true,
            data: updated,
        });
    }

    static async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        await GalleryService.delete(request.params.id);
        return reply.send({
            success: true,
            message: "Gallery berhasil dihapus",
        });
    }
}
