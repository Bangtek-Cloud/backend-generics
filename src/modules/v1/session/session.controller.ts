import { FastifyReply, FastifyRequest } from "fastify";
import { SessionServices } from "./session.service";

export class SessionController {
    static async getAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const sessions = await SessionServices.getAll();
            return reply.status(200).send({ success: true, data: sessions });
        } catch (error) {
            return reply.status(500).send({ success: false, message: (error as Error).message });
        }
    }

    static async removeSession(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            if (!id) {
            return reply.status(400).send({ success: false, message: "User ID is required" });
            }

            await SessionServices.delete(id);
            return reply.status(200).send({ success: true, message: "Session removed successfully" });
        } catch (error) {
            return reply.status(500).send({ success: false, message: (error as Error).message });
        }
    }
}
