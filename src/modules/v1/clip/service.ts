import prisma from "src/utils/prisma";

type GetAllParams = {
    page: number;
    limit: number;
    search?: string;
};

export class ClipService {
    static async create(data: {
        url: string;
        caption?: string;
    }) {
        return prisma.clip.create({
            data,
        });
    }

    static async getAll(params: GetAllParams) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                {
                    caption: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    url: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.clip.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.clip.count({ where }),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
        };
    }

    static async getById(id: string) {
        return prisma.clip.findUnique({
            where: { id },
        });
    }

    static async update(
        id: string,
        data: {
            url?: string;
            caption?: string;
        }
    ) {
        return prisma.clip.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string) {
        return prisma.clip.delete({
            where: { id },
        });
    }
}
