import prisma from "../../../utils/prisma";

export async function createTournament(data: any) {
    const newData = await prisma.tournaments.create({
        data
    })
    return newData
}

export async function getAllTournaments() {
    const tournaments = await prisma.tournaments.findMany({
        orderBy: [
            { createdAt: 'desc' },
            { eventId: 'desc' }
        ],
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
            event: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    logo: true,
                    location: true,
                    startDate: true,
                    endDate: true,
                    isActive: true,
                    rules: true,
                }
            }
        }
    })

    // Convert logo to base64
    const transformedTournaments = tournaments.map(tournament => {
        const logoBuffer = tournament.event?.logo;
        const logoBase64 = logoBuffer
            ? Buffer.from(logoBuffer).toString('base64')
            : null;

        return {
            ...tournament,
            event: {
                ...tournament.event,
                logo: logoBase64,
                rules: JSON.parse(typeof tournament.event.rules === "string" ? tournament.event.rules : "[]"),
            }
        };
    });

    return transformedTournaments;
    // return tournaments
}


export async function getTournamentById(id: string) {
    const tournament = await prisma.tournaments.findUnique({
        where: {
            id,
        },
        include: {
            contestants: {
                include: {
                    user: {
                        select: {
                            name: true,
                            avatar: true,
                            avatarFile: true,
                            email: true,
                        },
                    },
                },
            },
            event: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
        },
    });

    if (!tournament) {
        return null;
    }

    // Transformasi logo untuk setiap contestant
    const contestantsWithLogo = tournament.contestants.map((contestant) => {
        const logoBuffer = contestant.logo as Buffer | null;
        const logoBase64 = logoBuffer
            ? Buffer.from(logoBuffer).toString("base64")
            : null;

        return {
            ...contestant,
            logo: logoBase64,
            equipmentOwned: JSON.parse(typeof contestant.equipmentOwned === "string" ? contestant.equipmentOwned : "[]") ?? []
        };
    });

    const transformedTournament = {
        ...tournament,
        contestants: contestantsWithLogo,
    };

    return transformedTournament;
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

export async function getAllPendingTournaments(userId: string) {
    const tournaments = await prisma.tournaments.findMany({
        where: {
            contestants: {
                some: {
                    userId,
                    isVerified: false
                }
            },
            startDate: {
                gte: new Date()
            }
        }, select: {
            id: true,
            name: true,
        }
    })
    return tournaments
}

export async function getAllTournamentByUserId(userId: string) {
    const tournaments = await prisma.contestant.findMany({
        where: {
            userId,
        }, select: {
            isVerified: true,
            id: true,
            tournament: true,
        }
    })
    return tournaments
}