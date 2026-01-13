import prisma from "src/utils/prisma";

type GetAllParams = {
    page: number;
    limit: number;
    search?: string;
    published?: boolean;
};

export class ArticleService {
    static async create(data: {
        title: string;
        excerpt?: string;
        content: string;
        image?: string;
        published: boolean;
        createdById: string;
        updatedById: string;
    }) {
        return prisma.article.create({
            data: {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    static async getAll(params: GetAllParams) {
        const { page, limit, search, published } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    excerpt: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        if (typeof published === "boolean") {
            where.published = published;
        }

        const [data, total] = await Promise.all([
            prisma.article.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    createdBy: true,
                    updatedBy: true,
                },
            }),
            prisma.article.count({ where }),
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
        return prisma.article.findUnique({
            where: { id },
        });
    }

    static async update(
        id: string,
        data: {
            title?: string;
            excerpt?: string;
            content?: string;
            image?: string;
            published?: boolean;
            updatedById: string;
        }
    ) {
        return prisma.article.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string) {
        return prisma.article.delete({
            where: { id },
        });
    }
}
