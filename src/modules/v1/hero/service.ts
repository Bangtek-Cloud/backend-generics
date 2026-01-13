import prisma from "src/utils/prisma";

export class HeroService {
    static async createHero(data: {
        title: string;
        description: string;
        subTitle: string;
        image: string;
        buttonText: string;
        buttonLink: string;
    }) {
        const find = await prisma.hero.findFirst();
        if (find) {
            return prisma.hero.update({
                where: { id: find.id },
                data: {
                    title: data.title,
                    description: data.description,
                    subTitle: data.subTitle,
                    image: data.image,
                    buttonText: data.buttonText,
                    buttonLink: data.buttonLink,
                },
            });
        } else {
            return prisma.hero.create({
                data: {
                    title: data.title,
                    description: data.description,
                    subTitle: data.subTitle,
                    image: data.image,
                    buttonText: data.buttonText,
                    buttonLink: data.buttonLink,
                },
            });
        }
    }

    static async getHero() {
        return prisma.hero.findFirst();
    }
}