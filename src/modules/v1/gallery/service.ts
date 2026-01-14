import prisma from "src/utils/prisma";

type GetAllParams = {
    page: number;
    limit: number;
    search?: string;
};

export class GalleryService {
    static async create(data: {
        image: string;
        caption?: string;
    }) {
        return prisma.gallery.create({
            data: {
                image: data.image,
                caption: data.caption,
            },
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
            ];
        }

        const [data, total] = await Promise.all([
            prisma.gallery.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.gallery.count({ where }),
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
        return prisma.gallery.findUnique({
            where: { id },
        });
    }

    static async update(
        id: string,
        data: {
            image?: string;
            caption?: string;
        }
    ) {
        const body = {
            ...data,
            updatedAt: new Date(),
        }
        return prisma.gallery.update({
            where: { id },
            data: body,
        });
    }

    static async delete(id: string) {
        return prisma.gallery.delete({
            where: { id },
        });
    }
}
