import { FastifyReply, FastifyRequest } from "fastify";
import { createTournament, deleteTournament, getAllTournaments, getTournamentById, updateTournament } from "./tournaments.service";

export async function addNewTournamentHandler(request: FastifyRequest, reply: FastifyReply) {
    const {
        name,
        description,
        prize,
        startDate,
        endDate,
        status,
        maxParticipants,
        location,
        rules,
        usingLogoPrice,
        price,
        disabled
    } = request.body as any;
    try {
        const tournament = {
            name,
            description,
            prize,
            startDate,
            endDate,
            status,
            maxParticipants,
            location,
            rules,
            usingLogoPrice,
            price,
            disabled
        }
        const savedTournament = await createTournament(tournament);
        if (!savedTournament) {
            return reply.status(500).send({
                code: 500,
                message: "Failed to create tournament",
            })
        }
        return reply.status(201).send({
            code: 201,
            message: "Tournament created successfully",
        })
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }

}

export async function getAllTournamentsHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const tournaments = await getAllTournaments();
        return reply.status(200).send({
            code: 200,
            data: tournaments,
        })
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }
}

export async function getTournamentByIdHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    try {
        const tournament = await getTournamentById(id);
        if (!tournament) {
            return reply.status(404).send({
                code: 404,
                message: "Tournament not found",
            })
        }
        return reply.status(200).send({
            code: 200,
            data: tournament,
        })
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }
}

export async function updateTournamentHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const {
        name,
        description,
        prize,
        startDate,
        endDate,
        status,
        maxParticipants,
        location,
        rules,
        usingLogoPrice,
        price,
        disabled
    } = request.body as any;
    try {
        const tournament = {
            name,
            description,
            prize,
            startDate,
            endDate,
            status,
            maxParticipants,
            location,
            rules,
            usingLogoPrice,
            price,
            disabled
        }
        const updatedTournament = await updateTournament(id, tournament);
        if (!updatedTournament) {
            return reply.status(500).send({
                code: 500,
                message: "Failed to update tournament",
            })
        }
        return reply.status(200).send({
            code: 200,
            message: "Tournament updated successfully",
        })
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }
}

export async function deleteTournamentHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    try {
        const tournament = await getTournamentById(id);
        if (!tournament) {
            return reply.status(404).send({
                code: 404,
                message: "Tournament not found",
            })
        }
        await deleteTournament(id);
        return reply.status(200).send({
            code: 200,
            message: "Tournament deleted successfully",
        })
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }
}