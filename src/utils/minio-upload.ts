import crypto from "crypto";
import { createMinioClient } from "./minio";
import { FastifyInstance } from "fastify";

type UploadResult = {
    objectPath: string;
};

export async function uploadFileToMinio(params: {
    server: FastifyInstance;
    bucket: string;
    buffer: Buffer;
    originalName?: string;
    prefix?: string;
}): Promise<UploadResult> {
    const { server, bucket, buffer, originalName, prefix = "file" } = params;

    const minioClient = createMinioClient(server);
    const ext = originalName?.split(".").pop() || "png";
    const fileName = `${prefix}-${crypto.randomUUID()}.${ext}`;

    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
        await minioClient.makeBucket(bucket, "us-east-1");
    }

    await minioClient.putObject(bucket, fileName, buffer, buffer.length);

    return {
        objectPath: `${bucket}/${fileName}`,
    };
}
