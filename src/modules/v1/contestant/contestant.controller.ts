import { FastifyReply, FastifyRequest } from "fastify";
import { ContestantService } from "./contestant.service";
import { validatePriceHandler } from "../tournaments/tournaments.controller";

export async function getAllContestants(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { tournament } = request.params as { tournament: string };

        const contestants = await ContestantService.getAllContestants(tournament);
        return reply.status(200).send({ success: true, data: contestants });
    } catch (error) {
        return reply.status(500).send({ success: false, message: error.message });
    }
}

export async function getContestant(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user.id
        const { tournament } = request.params as { tournament: string };
        const contestants = await ContestantService.getContestantByUserIdAndTournamentId(tournament, userId);
        return reply.status(200).send({ success: true, data: contestants });
    } catch (error) {
        return reply.status(500).send({ success: false, message: error.message });
    }
}

export async function createContestant(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { tournament } = request.params as { tournament: string };
        const userId = request.user.id
        const contestants = await ContestantService.getContestantByUserIdAndTournamentId(tournament, userId);
        if (contestants) {
            console.error("Contestant already registered:", contestants);
            return reply.status(400).send({
                success: false,
                alreadyRegistered: true,
                error: "Anda sudah mendaftar di turnamen ini",
            });
        }
        const parts = request.parts();
        let logoBuffer: Buffer | undefined;

        const contestantData: any = {};

        for await (const part of parts) {
            if (part.type === "file") {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                logoBuffer = Buffer.concat(chunks);
            } else {
                contestantData[part.fieldname] = part.value;
            }
        }

        const { playerType, equipmentSource, equipmentOwned, isVerified, shirtSize, usingLogo, price, optionPrice, storeName, storeAddress } = contestantData;
        if (!optionPrice) {
            return reply.status(400).send({
                success: false,
                alreadyRegistered: false,
                error: "Waduh sepertinya ada yang salah, harga tidak sesuai",
            });
        }

        const checkPrice = await validatePriceHandler(tournament, price, optionPrice, contestantData.usingLogo === "true" ? true : false)
        if (!checkPrice) {
            return reply.status(400).send({
                success: false,
                alreadyRegistered: false,
                error: "Waduh sepertinya ada yang salah, harga tidak sesuai",
            });
        }

        await ContestantService.createContestant({
            userId,
            tournamentId: tournament,
            playerType,
            equipmentSource: equipmentSource === "true",
            isVerified,
            usingLogo: usingLogo === "true",
            optionPrice: parseInt(optionPrice),
            logo: logoBuffer,
            price: parseInt(price),
            storeName,
            storeAddress,
            shirtSize,
            equipmentOwned
        });

        return reply.status(201).send({ success: true, message: "Contestant created successfully" });
    } catch (error) {
        console.error("Error creating contestant:", error);
        return reply.status(500).send({ success: false, alreadyRegistered: false, message: "Error creating contestant", error: error.message });
    }
}

export async function updateContestant(request: FastifyRequest, reply: FastifyReply) {
    const { contestantId } = request.params as { contestantId: string };
    try {
        const { isVerified } = request.body as { isVerified: boolean };
        await ContestantService.updateContestant(Number(contestantId), {
            isVerified
        })
        return reply.status(200).send({ success: true, message: "Contestant updated successfully" });
    } catch (error) {
        console.error("Error deleting contestant:", error);
        return reply.status(500).send({ success: false, message: "Error deleting contestant", error: error.message });
    }
}
export async function deleteContestant(request: FastifyRequest, reply: FastifyReply) {
    const { contestant } = request.params as { contestant: number };
    const userId = request.user.id
    try {
        await ContestantService.deleteContestant(contestant, userId);
        return reply.status(200).send({ success: true, message: "Contestant deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting contestant:", error);
        return reply.status(500).send({ success: false, message: "Error deleting contestant", error: error.message });
    }
}