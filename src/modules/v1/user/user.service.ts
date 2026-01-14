import { hashPassword } from "../../../utils/hash";
import prisma from "../../../utils/prisma";
import { CreateUserInput, UpdateInput } from "./user.schema";


type getAllUser = {
    page: number;
    limit: number;
    search?: string;
};

export async function getAllUser(params: getAllUser) {
    const {
        page = 1,
        limit = 10,
        search
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
        where.OR = [
            {
                name: { contains: search, mode: "insensitive" }
            },
            {
                email: { contains: search, mode: "insensitive" }
            }
        ];
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                role: "desc"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                avatarFile: true,
                usingAvatar: true,
                updatedAt: true,
            }
        },
        ),
        prisma.user.count({ where })
    ]);
    return {
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export async function createUser(input: CreateUserInput) {
    const { password, ...rest } = input;
    const { hash, salt } = hashPassword(password);
    const user = await prisma.user.create({
        data: {
            name: rest.name,
            email: rest.email,
            salt,
            password: hash,
            avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=' + rest.email
        }
    });

    return user
}

export async function findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    return user
}

export async function findUser(id: string) {
    return prisma.user.findFirst({
        where: {
            id
        }
    });
}

export async function updateUser(id: string, data: any) {
    return prisma.user.update({
        where: {
            id
        },
        data
    })
}