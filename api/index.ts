import { VercelRequest, VercelResponse } from "@vercel/node";
import server from "../src/server"; // Import server Fastify

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await server.ready();
    server.server.emit("request", req, res);
}
