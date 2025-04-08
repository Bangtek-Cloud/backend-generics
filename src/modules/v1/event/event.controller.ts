import { FastifyReply, FastifyRequest } from "fastify";
import { EventService } from "./event.service";
import { createMinioClient } from "../../../utils/minio";

import crypto from 'crypto';

export async function createEventHandler(request: FastifyRequest, reply: FastifyReply) {
  const minioClient = createMinioClient(request.server);
  const bucketName = "event-logo";
  const { user } = request;

  try {
    const parts = request.parts();
    let logoBuffer: Buffer | undefined;
    let logoFileName = "";
    const eventData: any = {};

    for await (const part of parts) {
      if (part.type === "file") {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        logoBuffer = Buffer.concat(chunks);

        const ext = part.filename?.split('.').pop() || 'png';
        logoFileName = `logo-${crypto.randomUUID()}.${ext}`;
      } else {
        eventData[part.fieldname] = part.value;
      }
    }

    const { name, description, startDate, endDate, location, isActive, rules } = eventData;
    if (!name || !description || !startDate || !endDate) {
      return reply.status(400).send({
        success: false,
        error: "Semua field harus diisi",
      });
    }

    let logoUrl = "";
    if (logoBuffer && logoFileName) {
      // Buat bucket jika belum ada
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
      }

      // Upload logo ke MinIO
      await minioClient.putObject(bucketName, logoFileName, logoBuffer, logoBuffer.length);

      // URL akses (bisa disesuaikan)
      logoUrl = `${bucketName}/${logoFileName}`;
    }

    const event = await EventService.createEvent({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      eventLogoUrl: logoUrl,
      location,
      isActive: isActive === 'true',
      rules,
    });

    return reply.status(201).send({ success: true, message: "Event berhasil disimpan" });
  } catch (error) {
    console.error("Error creating event:", error, { user });
    return reply.status(500).send({ success: false, message: 'Terjadi kesalahan dalam membuat events' });
  }
}


export async function updateEventHandler(request: FastifyRequest, reply: FastifyReply) {
    const minioClient = createMinioClient(request.server);
    const bucketName = "event-logo";
    const { id } = request.params as { id: string };
    const { user } = request;
  
    try {
      const parts = request.parts();
      let logoBuffer: Buffer | undefined;
      let logoFileName = "";
      const eventData: any = {};
  
      for await (const part of parts) {
        if (part.type === "file") {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          logoBuffer = Buffer.concat(chunks);
          const ext = part.filename?.split(".").pop() || "png";
          logoFileName = `logo-${crypto.randomUUID()}.${ext}`;
        } else {
          eventData[part.fieldname] = part.value;
        }
      }
  
      const existingEvent = await EventService.getEventById(id);
      if (!existingEvent) {
        return reply.status(404).send({ success: false, message: "Event tidak ditemukan" });
      }
  
      let logoUrl = existingEvent.eventLogoUrl;
  
      if (logoBuffer && logoFileName) {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
          await minioClient.makeBucket(bucketName, "us-east-1");
        }
  
        await minioClient.putObject(bucketName, logoFileName, logoBuffer, logoBuffer.length);
        logoUrl = `${bucketName}/${logoFileName}`;
      }
  
      const updatedEvent = await EventService.updateEvent(id, {
        ...eventData,
        eventLogoUrl: logoUrl,
        startDate: eventData.startDate ? new Date(eventData.startDate) : existingEvent.startDate,
        endDate: eventData.endDate ? new Date(eventData.endDate) : existingEvent.endDate,
        isActive: eventData.isActive === "true",
      });
  
      if (!updatedEvent) {
        return reply.status(404).send({ success: false, message: "Event tidak ditemukan" });
      }
  
      return reply.status(200).send({ success: true, message: "Event berhasil diperbarui" });
    } catch (error) {
      console.error("Error updating event:", error, { user });
      return reply.status(500).send({ success: false, message: "Terjadi kesalahan dalam memperbarui events" });
    }
  }

export async function getEventByIdHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
        const event = await EventService.getEventById(id);
        if (!event) {
            return reply.status(404).send({ success: false, message: "Event tidak ditemukan" });
        }
        return reply.status(200).send({ success: true, data: event });
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        return reply.status(500).send({ success: false, message: 'Terjadi kesalahan dalam mengambil events' });
    }
}

export async function getAllEventsHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const events = await EventService.getAllEvents();
        return reply.status(200).send({ success: true, error: false, data: events });
    } catch (error) {
        console.error("Error fetching all events:", error);
        return reply.status(500).send({ success: false, error: 'Terjadi kesalahan dalam mengambil semua events' });
    }
}

export async function deleteEventHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
        const deleted = await EventService.deleteEvent(id);
        if (!deleted) {
            return reply.status(404).send({ success: false, message: "Event tidak ditemukan" });
        }
        return reply.status(200).send({ success: true, message: "Event berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return reply.status(500).send({ success: false, message: 'Terjadi kesalahan dalam menghapus events' });
    }
}