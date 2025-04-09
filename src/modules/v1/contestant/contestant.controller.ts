import { FastifyReply, FastifyRequest } from "fastify";
import { ContestantService } from "./contestant.service";
import { validatePriceHandler } from "../tournaments/tournaments.controller";
import { createMinioClient } from "../../../utils/minio";

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
    const minioClient = createMinioClient(request.server);
    const bucketName = "contestant";
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
        let logoFileName = "";

        const contestantData: any = {};

        for await (const part of parts) {
            if (part.type === "file") {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                logoBuffer = Buffer.concat(chunks);
                logoFileName = `contestant-logo-${crypto.randomUUID()}.png`;
            } else {
                contestantData[part.fieldname] = part.value;
            }
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

        const { playerType, phoneNo, equipmentSource, equipmentOwned, isVerified, shirtSize, usingLogo, price, optionPrice, storeName, storeAddress } = contestantData;
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
            logoUrl,
            price: parseInt(price),
            storeName,
            storeAddress,
            shirtSize,
            phoneNo,
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

export async function exportDataTournamentHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id, bool } = request.params as any;
    try {
        const contestant = await ContestantService.getAllContestantsWithCondition(id, bool);
        const csvHeader = [
            "Nomor Peserta",
            "Foto Peserta",
            "Nama Peserta",
            "Email Peserta",
            "No HP",
            "Tipe Peserta",
            "Logo",
            "Peserta Mewakili",
            "Alamat",
            "Ukuran Baju",
            "Alat sendiri",
            "Alat dibawa",
            "Paket dipilih",
            "Harga Paket",
            "Turnamen",
            "Verifikasi"
        ].map(col => `"${col}"`).join(',') + '\n'
        const csvRows = contestant.map((c, index) => {
            const priceList = c.tournament.price as { key: number; value: string, amount: number }[];
            const selectedPackage = priceList.find(p => p.key === c.optionPrice)?.value || '';
            const selectedPrice = priceList.find(p => p.key === c.optionPrice)?.amount || '';
            return [
                `"${c.id}"`,
                `"${c.user.avatar}"`,
                `"${c.user.name}"`,
                `"${c.user.email}"`,
                `"${c.phoneNo}"`,
                `"${c.playerType}"`,
                `"${c.logoUrl}"`,
                `"${c.storeName}"`,
                `"${c.storeAddress}"`,
                `"${c.shirtSize}"`,
                `"${c.equipmentSource ? "Alat Sendiri" : "Tidak membawa"}"`,
                `"${c.equipmentOwned}"`,
                `"${selectedPackage}"`,
                `"${selectedPrice}"`,
                `"${c.tournament.name}"`,
                `"${c.isVerified ? "Sudah Verifikasi" : "Belum Verifikasi"}"`
            ].join(',')
        }).join('\n')



        const csvContent = csvHeader + csvRows
        reply.header('Content-Type', 'text/csv')
        reply.header('Content-Disposition', 'attachment; filename=peserta-turnamen.csv')
        reply.send(csvContent)

        // reply.send(contestant)
    } catch (error) {
        console.log(error);
        return reply.status(500).send({
            code: 500,
            message: "Internal server error",
        })
    }
}