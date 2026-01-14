import { FastifyReply, FastifyRequest } from "fastify";
import { ArticleService } from "./service";
import { uploadFileToMinio2 } from "src/utils/mini-upload2";

const BUCKET_NAME = "event-logo";

export class ArticleController {
    static async create(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            let title = "";
            let excerpt: string | undefined;
            let content = "";
            let published = false;
            let imagePath: string | undefined;

            for await (const part of request.parts()) {
                if (part.type === "file") {
                    const upload = await uploadFileToMinio2({
                        server: request.server,
                        bucket: BUCKET_NAME,
                        stream: part.file,              // ✅ streaming
                        originalName: part.filename,
                        prefix: "article",
                        contentType: part.mimetype,
                    });

                    imagePath = upload.objectPath;
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

            const userId = request.user.id;

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
                avatar: item.createdBy.usingAvatar
                    ? process.env.S3_URL + item.createdBy.avatar : item.createdBy.avatar
            },
            updatedBy: {
                name: item.updatedBy.name,
                avatar: item.updatedBy.usingAvatar
                    ? process.env.S3_URL + item.updatedBy.avatar : item.createdBy.avatar
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
                id: data.id,
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
                published: data.published,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                image: data.image
                    ? process.env.S3_URL + data.image
                    : null,
                createdBy: {
                    name: data.createdBy.name,
                    avatar: data.createdBy.usingAvatar
                        ? process.env.S3_URL + data.createdBy.avatar : data.createdBy.avatar
                },
                updatedBy: {
                    name: data.updatedBy.name,
                    avatar: data.updatedBy.usingAvatar
                        ? process.env.S3_URL + data.updatedBy.avatar : data.createdBy.avatar
                },
            },
        });
    }

    static async update(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;

            const existing = await ArticleService.getById(id);
            if (!existing) {
                return reply.status(404).send({
                    success: false,
                    message: "Article tidak ditemukan",
                });
            }

            let title: string | undefined;
            let excerpt: string | undefined;
            let content: string | undefined;
            let published: boolean | undefined;
            let imagePath: string | undefined;

            for await (const part of request.parts()) {
                if (part.type === "file") {
                    const upload = await uploadFileToMinio2({
                        server: request.server,
                        bucket: BUCKET_NAME,
                        stream: part.file,            // ✅ STREAM
                        originalName: part.filename,
                        prefix: "article",
                        contentType: part.mimetype,
                    });

                    imagePath = upload.objectPath;
                } else {
                    if (part.fieldname === "title") title = String(part.value);
                    if (part.fieldname === "excerpt") excerpt = String(part.value);
                    if (part.fieldname === "content") content = String(part.value);
                    if (part.fieldname === "published") {
                        published = part.value === "true";
                    }
                }
            }

            const updated = await ArticleService.update(id, {
                title,
                excerpt,
                content,
                image: imagePath, // undefined = tidak diupdate
                published,
                updatedById: request.user.id,
            });

            return reply.send({
                success: true,
                data: updated,
            });
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({
                success: false,
                message: error.message,
            });
        }
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
