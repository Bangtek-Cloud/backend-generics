import { Event } from "@prisma/client";
import prisma from "../../../utils/prisma";

export class EventService {
    static async createEvent(data: {
        name: string;
        description?: string;
        startDate: Date;
        endDate: Date;
        // logo?: Buffer;
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
                    // logo: data.logo || undefined,
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

    static async getAllEvents(): Promise<Event[]> {
        try {
            const events = await prisma.event.findMany({
                orderBy: [{ startDate: "asc" }],
            });

            return events.map((event) => ({
                ...event,
                rules: JSON.parse(typeof event.rules === "string" ? event.rules : "[]"),
                logo: false,
            })) as unknown as Event[];
        } catch (error) {
            throw new Error(`Gagal mendapatkan semua event: ${error.message}`);
        }
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
    }>): Promise<Event> {
        console.log(data)
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
                },
            });
            console.log('Updated Event:', updatedEvent);
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