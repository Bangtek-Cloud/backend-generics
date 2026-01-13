import crypto from "crypto";
import { createMinioClient } from "./minio";
import { FastifyInstance } from "fastify";
import { Readable } from "stream";

type UploadResult = {
    objectPath: string;
};

export async function uploadFileToMinio2(params: {
    stream: Readable; // ✅ stream Node.js
    server: FastifyInstance;
    bucket: string;
    originalName?: string;
    prefix?: string;
    contentType?: string;
}): Promise<UploadResult> {
    const {
        server,
        bucket,
        stream,
        originalName,
        prefix = "file",
        contentType,
    } = params;

    const minioClient = createMinioClient(server);

    const ext = originalName?.split(".").pop() || "bin";
    const fileName = `${prefix}-${crypto.randomUUID()}.${ext}`;

    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
        await minioClient.makeBucket(bucket, "us-east-1");
    }

    // ⬇️ STREAM LANGSUNG
    await minioClient.putObject(
        bucket,
        fileName,
        stream,
        undefined, // size optional kalau stream
        contentType ? { "Content-Type": contentType } : undefined
    );

    return {
        objectPath: `${bucket}/${fileName}`,
    };
}
