import { FastifyReply, FastifyRequest } from "fastify";
import { createTournament, deleteTournament, getAllPendingTournaments, getAllTournamentByUserId, getAllTournaments, getTournamentById, updateTournament } from "./tournaments.service";
import { Role } from "@prisma/client";

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
        eventId,
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
            eventId,
            disabled
        }
        if (!eventId) {
            return reply.status(400).send({
                code: 400,
                message: "Masukan eventId",
            })
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

export async function getAllTournamentsHandler(request: FastifyRequest<{
    Querystring: {
        page?: string;
        limit?: number;
        search?: string;
        eventId?: string;
        status?: "active" | "disable" | "all";
    }
}>, reply: FastifyReply) {
    const { role } = request.user.publicMeta;
    const {
        page = 1,
        limit = 10,
        search = "",
        eventId = "",
        status = "all",
    } = request.query;
    try {
        const result = await getAllTournaments({
            role: role as Role,
            page: Number(page),
            limit: Number(limit),
            search,
            status,
            eventId
        });
        const mappingData = result.data.map((item) => ({
            id: item.id,
            name: item?.name,
            rules: item?.rules,
            participan: item.contestants.length,
            maxParticipan: item.maxParticipants,
            status: item.status,
            start: item.startDate,
            end: item.endDate,
            desciption: item.description,
            isActive: !item.disabled,
            prize: item.prize,
            image: item.event.eventLogoUrl
                ? process.env.S3_URL + item.event.eventLogoUrl
                : null,
            eventName: item?.event?.name,
            location: item?.event?.location
        }))
        return reply.status(200).send({
            success: true,
            error: false,
            data: mappingData,
            meta: result.meta,
        })
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }
}


export async function getAllTournamentsHandlers(request: FastifyRequest<{
    Querystring: {
        page?: string;
        limit?: number;
        search?: string;
        eventId?: string;
        status?: "active" | "disable" | "all";
    }
}>, reply: FastifyReply) {
    const {
        page = 1,
        limit = 10,
        search = "",
        eventId = "",
        status = "all",
    } = request.query;
    try {
        const result = await getAllTournaments({
            role: "USER",
            page: Number(page),
            limit: Number(limit),
            search,
            status,
            eventId
        });
        const mappingData = result.data.map((item) => ({
            id: item.id,
            name: item?.name,
            rules: item?.rules,
            participan: item.contestants.length,
            maxParticipan: item.maxParticipants,
            status: item.status,
            start: item.startDate,
            end: item.endDate,
            desciption: item.description,
            isActive: !item.disabled,
            prize: item.prize,
            image: item.event.eventLogoUrl
                ? process.env.S3_URL + item.event.eventLogoUrl
                : null,
            eventName: item?.event?.name,
            location: item?.event?.location
        }))
        return reply.status(200).send({
            success: true,
            error: false,
            data: mappingData,
            meta: result.meta,
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

export async function getAllPendingTournamentsHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user.id
        const tournaments = await getAllPendingTournaments(userId);

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

export async function validatePriceHandler(id: any, price: any, option: any, usingLogo: any) {
    const tournament = await getTournamentById(id);
    if (!tournament) {
        return false
    }
    const prices = Array.isArray(tournament.price) ? tournament.price : [];
    const selectedPrice: any = prices.find((p: any) => p.key === Number(option));
    // const sum = (selectedPrice?.amount || 0) + tournament.usingLogoPrice;
    if (!selectedPrice || !selectedPrice.amount) {
        console.log('error disini')
        return false
    }
    if (usingLogo) {
        const sum = selectedPrice.amount + tournament.usingLogoPrice;
        console.info('SUM1', sum)
        if (sum !== Number(price)) {
            return false
        }
    } else {
        const sum = selectedPrice.amount
        console.info('SUM2', sum)
        if (sum !== Number(price)) {
            return false
        }
    }
    return true
}

export async function getAllTournamentByUserIdHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = request.user.id
        const tournaments = await getAllTournamentByUserId(userId);
        return reply.status(200).send({
            code: 200,
            data: tournaments,
        })
    }
    catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            error: "Internal server error",
        })
    }
}