import { Role } from "@prisma/client";
import prisma from "../../../utils/prisma";

type GetAllEventsParams = {
  role: Role;
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "disable" | "all";
};

export async function createTournament(data: any) {
  const newData = await prisma.tournaments.create({
    data
  })
  return newData
}

export async function getAllTournaments(params: GetAllEventsParams) {
  const {
    role,
    page = 1,
    limit = 10,
    search
  } = params;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (role !== "ADMIN" && role !== "SU") {
    where.event = { isActive: true };
  }

  if (search) {
    where.OR = [
      {
        name: { contains: search, mode: "insensitive" }
      },
      {
        event: {
          name: { contains: search, mode: "insensitive" }
        }
      },
      {
        event: {
          description: { contains: search, mode: "insensitive" }
        }
      },
      {
        event: {
          location: { contains: search, mode: "insensitive" }
        }
      }
    ];
  }

  const [tournaments, total] = await Promise.all([
    prisma.tournaments.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { createdAt: "desc" },
        { eventId: "desc" }
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
            eventLogoUrl: true,
            location: true,
            startDate: true,
            endDate: true,
            isActive: true,
            rules: true
          }
        }
      }
    }),
    prisma.tournaments.count({ where })
  ]);

  const data = tournaments.map((t) => ({
    ...t,
    event: {
      ...t.event,
      rules:
        typeof t.event.rules === "string"
          ? JSON.parse(t.event.rules || "{}")
          : t.event.rules ?? {}
    }
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
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
              usingAvatar: true
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

  const contestantsWithLogo = tournament.contestants.map((contestant) => {
    return {
      ...contestant,
      equipmentOwned: JSON.parse(typeof contestant.equipmentOwned === "string" ? contestant.equipmentOwned : "[]") ?? [],
      user: {
        ...contestant.user,
        avatar: contestant.user.usingAvatar ? process.env.S3_URL + contestant.user.avatar : contestant.user.avatar
      }
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
    },
    orderBy: {
      tournament: {
        startDate: 'desc'
      }
    },

    select: {
      isVerified: true,
      id: true,
      tournament: true,
    },
  })
  return tournaments
}