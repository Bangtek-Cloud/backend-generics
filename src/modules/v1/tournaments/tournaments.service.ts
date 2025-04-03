import prisma from "../../../utils/prisma";

export async function createTournament(data: any) {
    const newData = await prisma.tournaments.create({
        data
    })
    return newData
}

export async function getAllTournaments() {
    const tournaments = await prisma.tournaments.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            contestants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
        }
    })
    return tournaments
}

export async function getTournamentById(id: string) {
    const tournament = await prisma.tournaments.findUnique({
        where: {
            id
        }
    })
    return tournament
}

export async function updateTournament(id: string, data: any) {
    const tournament = await prisma.tournaments.update({
        where: {
            id
        },
        data
    })
    return tournament
}

export async function deleteTournament(id: string) {
    const tournament = await prisma.tournaments.delete({
        where: {
            id
        }
    })
    return tournament
}