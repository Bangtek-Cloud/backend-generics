import { FastifyReply, FastifyRequest } from "fastify";
import { uploadFileToMinio } from "src/utils/minio-upload";
import { ArticleService } from "./service";

const BUCKET_NAME = "event-logo";

export class ArticleController {
    static async create(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const parts = request.parts();

            let imageBuffer: Buffer | undefined;
            let imageName = "";

            let title = "";
            let excerpt: string | undefined;
            let content = "";
            let published = false;

            for await (const part of parts) {
                if (part.type === "file") {
                    const chunks: Buffer[] = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    imageBuffer = Buffer.concat(chunks);
                    imageName = part.filename || "";
                } else {
                    if (part.fieldname === "title") title = String(part.value);
                    if (part.fieldname === "excerpt") excerpt = String(part.value);
                    if (part.fieldname === "content") content = String(part.value);
                    if (part.fieldname === "published") {
                        published = part.value === "true";
                    }
                }
            }

            if (!title || !content) {
                return reply.status(400).send({
                    success: false,
                    message: "Title dan content wajib diisi",
                });
            }

            let imagePath: string | undefined;

            if (imageBuffer) {
                const upload = await uploadFileToMinio({
                    server: request.server,
                    bucket: BUCKET_NAME,
                    buffer: imageBuffer,
                    originalName: imageName,
                    prefix: "article",
                });
                imagePath = upload.objectPath;
            }

            const userId = request.user.id;
            console.log(userId, 'ISI USERID');
            console.log('ISI USERRRR', JSON.stringify(request.user))


            const data = await ArticleService.create({
                title,
                excerpt,
                content,
                image: imagePath,
                published,
                createdById: userId,
                updatedById: userId,
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
            Querystring: {
                page?: number;
                limit?: number;
                search?: string;
                published?: boolean;
            };
        }>,
        reply: FastifyReply
    ) {
        const page = Number(request.query.page ?? 1);
        const limit = Number(request.query.limit ?? 10);

        const result = await ArticleService.getAll({
            page,
            limit,
            search: request.query.search,
            published: request.query.published,
        });

        const mapped = result.data.map(item => ({
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            content: item.content,
            published: item.published,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            image: item.image
                ? process.env.S3_URL + item.image
                : null,
            createdBy: {
                name: item.createdBy.name,
                avatar: item.createdBy.avatar
                    ? process.env.S3_URL + item.createdBy.avatar : null
            },
            updatedBy: {
                name: item.updatedBy.name,
                avatar: item.updatedBy.avatar
                    ? process.env.S3_URL + item.updatedBy.avatar : ""
            },
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
        const data = await ArticleService.getById(request.params.id);

        if (!data) {
            return reply.status(404).send({
                success: false,
                message: "Article tidak ditemukan",
            });
        }

        return reply.send({
            success: true,
            data: {
                ...data,
                image: data.image
                    ? process.env.S3_URL + data.image
                    : data.image,
            },
        });
    }

    static async update(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const { id } = request.params;
        const existing = await ArticleService.getById(id);

        if (!existing) {
            return reply.status(404).send({
                success: false,
                message: "Article tidak ditemukan",
            });
        }

        const parts = request.parts();

        let imageBuffer: Buffer | undefined;
        let imageName = "";

        let title: string | undefined;
        let excerpt: string | undefined;
        let content: string | undefined;
        let published: boolean | undefined;

        for await (const part of parts) {
            if (part.type === "file") {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                imageBuffer = Buffer.concat(chunks);
                imageName = part.filename || "";
            } else {
                if (part.fieldname === "title") title = String(part.value);
                if (part.fieldname === "excerpt") excerpt = String(part.value);
                if (part.fieldname === "content") content = String(part.value);
                if (part.fieldname === "published") {
                    published = part.value === "true";
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
                prefix: "article",
            });
            imagePath = upload.objectPath;
        }

        const updated = await ArticleService.update(id, {
            title,
            excerpt,
            content,
            image: imagePath,
            published,
            updatedById: request.user.id,
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
        await ArticleService.delete(request.params.id);
        return reply.send({
            success: true,
            message: "Article berhasil dihapus",
        });
    }
}
