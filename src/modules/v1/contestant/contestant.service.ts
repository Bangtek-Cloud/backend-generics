import { Contestant, PlayerType } from "@prisma/client";
import prisma from "../../../utils/prisma";

export class ContestantService {
    static async createContestant(data: {
        userId: string;
        tournamentId: string;
        playerType?: PlayerType;
        equipmentSource?: boolean;
        isVerified?: boolean;
        optionPrice?: number;
        usingLogo?: boolean;
        logoUrl?:string;
        price: number;
        storeName?: string;
        storeAddress?: string;
        equipmentOwned?: string;
        shirtSize?: string;
        phoneNo?:string;
    }): Promise<Contestant> {
        try {
            const newContestant = await prisma.contestant.create({
                data: {
                    userId: data.userId,
                    tournamentId: data.tournamentId,
                    playerType: data.playerType || 'INDIVIDUAL',
                    equipmentSource: data.equipmentSource || true,
                    isVerified: data.isVerified || false,
                    usingLogo: data.usingLogo || false,
                    optionPrice: data.optionPrice || undefined,
                    logoUrl: data.logoUrl || "",
                    price: data.price,
                    storeName: data.storeName || undefined,
                    storeAddress: data.storeAddress || undefined,
                    equipmentOwned: data.equipmentOwned || [""],
                    shirtSize: data.shirtSize || "",
                    phoneNo: data.phoneNo
                },
            });
            return newContestant;
        } catch (error) {
            throw new Error(`Error creating contestant: ${error.message}`);
        }
    }
    static async getAllContestants(tournamentId: string): Promise<Contestant[]> {
        try {
            const contestants = await prisma.contestant.findMany({
                where: { tournamentId },
            });
    
            return contestants.map(contestant => ({
                ...contestant,
                logo: contestant.logo
                    ? (`data:image/png;base64,${Buffer.from(contestant.logo).toString("base64")}` as any)
                    : null,
            })) as unknown as Contestant[];
        } catch (error) {
            throw new Error(`Error fetching contestants: ${error.message}`);
        }
    }

    static async getContestantByUserIdAndTournamentId(
        tournamentId: string,
        userId: string
    ): Promise<(Omit<Contestant, "logo"> & { logo: string | null }) | null> {
        try {
            const contestant = await prisma.contestant.findFirst({
                where: { userId, tournamentId },
                select: {
                    id: true,
                    userId: true,
                    tournamentId: true,
                    playerType: true,
                    equipmentSource: true,
                    isVerified: true,
                    usingLogo: true,
                    logoUrl: true,
                    price: true,
                    storeName: true,
                    equipmentOwned: true,
                    shirtSize: true,
                    storeAddress: true,
                    tournament: true,
                    optionPrice: true,
                    phoneNo: true,
                    contestantType: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
    
            if (!contestant) return null;
    
            return {
                ...contestant,
                phoneNo: contestant.phoneNo || "",
                contestantType: contestant.contestantType || "PLAYER",
                logo: null, // Add a default value for the logo property
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching contestant: ${error.message}`);
            }
            throw new Error("Unknown error occurred while fetching contestant");
        }
    }
    
    
    

    static async getContestantById(contestantId: number): Promise<Contestant | null> {
        try {
            const contestant = await prisma.contestant.findUnique({
                where: { id: contestantId },
            });
            return contestant;
        } catch (error) {
            throw new Error(`Error fetching contestant: ${error.message}`);
        }
    }

    static async updateContestant(
        contestantId: number,
        data: {
            playerType?: PlayerType;
            equipmentSource?: boolean;
            isVerified?: boolean;
            usingLogo?: boolean;
            logo?: Buffer;
            price?: number;
        }
    ): Promise<Contestant> {
        try {
            const updatedContestant = await prisma.contestant.update({
                where: { id: contestantId },
                data: {
                    ...data,
                    playerType: data.playerType as PlayerType,
                },
            });
            return updatedContestant;
        } catch (error) {
            throw new Error(`Error updating contestant: ${error.message}`);
        }
    }

    static async deleteContestant(contestantId: number, userId: string): Promise<Contestant> {
        try {
            const deletedContestant = await prisma.contestant.delete({
                where: { 
                    id: Number(contestantId),
                    userId,
                 },
            });
            return deletedContestant;
        } catch (error) {
            throw new Error(`Error deleting contestant: ${error.message}`);
        }
    }
}
