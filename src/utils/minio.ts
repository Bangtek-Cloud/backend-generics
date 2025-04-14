// libs/minio.ts
import { Client } from 'minio';
import { FastifyInstance } from 'fastify';

export function createMinioClient(app: FastifyInstance) {
  const config = process.env;

  return new Client({
    endPoint: config.MINIO_ENDPOINT,
    port: parseInt(config.MINIO_PORT),
    useSSL: config.MINIO_USE_SSL === 'true',
    accessKey: config.MINIO_ACCESS_KEY,
    secretKey: config.MINIO_SECRET_KEY,
  });
}
