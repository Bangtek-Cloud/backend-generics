import { Session } from '@prisma/client'
import prisma from 'src/utils/prisma'

export class SessionServices {
    static async createOrUpdate(data: {
        uid: string
        token: string
        mail: string
        name: string
        refresh: string
    }): Promise<boolean> {
        try {
            const getUid = await prisma.session.findUnique({
                where: {
                    uid: data.uid
                }
            })

            if (getUid) {
                await prisma.session.update({
                    where: {
                        id: getUid.uid
                    },
                    data: {
                        token: data.token,
                        refresh: data.token,
                        mail: data.mail,
                        name: data.name
                    }
                })
            } else {
                await prisma.session.create({
                    data: {
                        uid: data.uid,
                        token: data.token,
                        refresh: data.token,
                        mail: data.mail,
                        name: data.name
                    }
                })
            }

            return true
        } catch (error) {
            if (error.code && error.meta) {
                throw new Error(`Gagal membuat event: [${error.code}] ${error.meta.cause || error.message}`);
            }

            throw new Error(`Gagal membuat event: ${error.message || "Terjadi kesalahan tak dikenal"}`);
        }
    }

    static async findByUid(uid: string): Promise<Session> {
        try {
            const session = await prisma.session.findUnique({
                where: {
                    uid: uid
                }
            });

            if (!session) {
                throw new Error("Session not found");
            }

            return session;
        } catch (error) {
            if (error.code && error.meta) {
                throw new Error(`Gagal menemukan session: [${error.code}] ${error.meta.cause || error.message}`);
            }

            throw new Error(`Gagal menemukan session: ${error.message || "Terjadi kesalahan tak dikenal"}`);
        }
    }

    static async getAll(): Promise<Session[]>{
        const session = await prisma.session.findMany()
        return session
    }

    static async delete(uid: string): Promise<boolean> {
        const session = await prisma.session.findUnique({
            where: {
                uid: uid
            }
        });

        if (!session) {
            return true
        }

        await prisma.session.delete({
            where: {
                id: session.id
            }
        });

        return true;
    }
}