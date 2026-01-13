import { FastifyReply, FastifyRequest } from "fastify";
import { uploadFileToMinio } from "src/utils/minio-upload";
import { HeroService } from "./service";

const BUCKET_NAME = "event-logo";

export class HeroController {
    static async get(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const hero = await HeroService.getHero();

        if (!hero) {
            return reply.send({
                success: true,
                data: null,
            });
        }

        return reply.send({
            success: true,
            data: {
                ...hero,
                image: hero.image
                    ? process.env.S3_URL + hero.image
                    : null,
            },
        });
    }

    static async upsert(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const parts = request.parts();

            let imageBuffer: Buffer | undefined;
            let imageName = "";

            let title = "";
            let description: string | undefined;
            let subTitle: string | undefined;
            let buttonText: string | undefined;
            let buttonLink: string | undefined;

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
                    if (part.fieldname === "description") description = String(part.value);
                    if (part.fieldname === "subTitle") subTitle = String(part.value);
                    if (part.fieldname === "buttonText") buttonText = String(part.value);
                    if (part.fieldname === "buttonLink") buttonLink = String(part.value);
                }
            }

            if (!title) {
                return reply.status(400).send({
                    success: false,
                    message: "Title wajib diisi",
                });
            }

            let imagePath: string | undefined;

            if (imageBuffer) {
                const upload = await uploadFileToMinio({
                    server: request.server,
                    bucket: BUCKET_NAME,
                    buffer: imageBuffer,
                    originalName: imageName,
                    prefix: "hero",
                });
                imagePath = upload.objectPath;
            }

            const data = await HeroService.createHero({
                title,
                description,
                subTitle,
                image: imagePath,
                buttonText,
                buttonLink,
            });

            return reply.send({
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
}
