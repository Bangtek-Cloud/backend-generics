import { Event, Role } from "@prisma/client";
import prisma from "../../../utils/prisma";

type GetAllEventsParams = {
    page: number;
    limit: number;
    search?: string
    isActive: string
};

export class EventService {
    static async createEvent(data: {
        name: string;
        description?: string;
        startDate: Date;
        endDate: Date;
        bankId: string
        eventLogoUrl: string;
        location?: string;
        isActive?: boolean;
        rules?: string;
    }): Promise<Event> {
        try {
            const newEvent = await prisma.event.create({
                data: {
                    name: data.name || undefined,
                    description: data.description || undefined,
                    startDate: data.startDate || new Date(),
                    endDate: data.endDate || new Date(),
                    location: data.location || undefined,
                    isActive: data.isActive ?? true,
                    eventLogoUrl: data.eventLogoUrl ?? "",
                    bankId: data.bankId || undefined,
                    rules: data.rules || undefined,
                },
            });
            return newEvent;
        } catch (error) {
            if (error.code && error.meta) {
                throw new Error(`Gagal membuat event: [${error.code}] ${error.meta.cause || error.message}`);
            }

            throw new Error(`Gagal membuat event: ${error.message || "Terjadi kesalahan tak dikenal"}`);
        }
    }

    static async getAllEvents(params: GetAllEventsParams) {
        const { page, limit, search, isActive } = params;

        const skip = (page - 1) * limit;

        const where: any = {};

        if (isActive === "active") {
            where.isActive = true
        }
        if (isActive === "disable") {
            where.isActive = false
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ];
        }

        const [total, events] = await prisma.$transaction([
            prisma.event.count({ where }),
            prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startDate: "desc" },
                include: {
                    tournaments: true
                }
            }),
        ]);

        return {
            data: events.map(event => ({
                id: event.id,
                name: event.name,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                isActive: event.isActive,
                eventLogoUrl: event.eventLogoUrl,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
                tournament: event.tournaments.length,
                rules: JSON.parse(
                    typeof event.rules === "string" ? event.rules : "[]"
                ),
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getEventById(eventId: string): Promise<Event | null> {
        try {
            const event = await prisma.event.findUnique({
                where: { id: eventId },
            });

            if (!event) {
                throw new Error("Event tidak ditemukan");
            }

            return {
                ...event,
                logo: event.logo
                    ? (`data:image/png;base64,${Buffer.from(event.logo).toString("base64")}` as any)
                    : null,
            } as unknown as Event;
        } catch (error) {
            throw new Error(`Gagal mendapatkan event: ${error.message}`);
        }
    }

    static async updateEvent(eventId: string, data: Partial<{
        name: string;
        description?: string;
        startDate: Date;
        endDate: Date;
        eventLogoUrl?: string;
        location?: string;
        isActive?: boolean;
        rules?: string;
        bankId?: string
    }>): Promise<Event> {
        try {
            const updatedEvent = await prisma.event.update({
                where: { id: eventId },
                data: {
                    name: data.name || undefined,
                    description: data.description || undefined,
                    startDate: data.startDate || undefined,
                    endDate: data.endDate || undefined,
                    location: data.location || undefined,
                    isActive: data.isActive,
                    eventLogoUrl: data.eventLogoUrl ?? "",
                    rules: data.rules || undefined,
                    bankId: data.bankId || undefined,
                },
            });
            return {
                ...updatedEvent,
                logo: updatedEvent.logo
                    ? (`data:image/png;base64,${Buffer.from(updatedEvent.logo).toString("base64")}` as any)
                    : null,
            } as unknown as Event;
        } catch (error) {
            throw new Error(`Gagal memperbarui event: ${error.message}`);
        }
    }

    static async deleteEvent(eventId: string) {
        try {
            const event = await prisma.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                return null;
            } else {
                await prisma.event.delete({
                    where: { id: eventId },
                });
                return true;
            }
            // Event deleted successfully
        } catch (error) {
            throw new Error(`Gagal menghapus event: ${error.message}`);
        }
    }
}