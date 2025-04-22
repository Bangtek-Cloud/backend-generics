import { WebsiteRoute, WebsiteView } from "@prisma/client";
import prisma from "../../../utils/prisma";

export class WebServices {
    static async createWebsiteView(data: {
        show: boolean;
        order: number;
        type: number;
        content: any;
        routeId: string;
    }): Promise<WebsiteView> {
        const websiteView = await prisma.websiteView.create({ data });
        return websiteView;
    }

    static async getWebsiteViewById(id: string): Promise<WebsiteView | null> {
        const websiteView = await prisma.websiteView.findUnique({
            where: { id },
        });
        return websiteView;
    }

    static async countWebsiteViewByRouteId(routeId: string): Promise<number> {
        const websiteView = await prisma.websiteView.count({
            where: { routeId },
        });
        return websiteView;
    }


    static async getWebsiteView(): Promise<WebsiteView[]> {
        const websiteView = await prisma.websiteView.findMany({
            include: {
                route: true
            }
        });
        return websiteView;
    }

    static async getAllWebsiteView(): Promise<WebsiteView[]> {
        const websiteView = await prisma.websiteView.findMany({
            orderBy: {
                order: "asc"
            },
            include: {
                route: true
            }
        });
        return websiteView;
    }

    static async getWebsiteViewByRouteId(routeId: string): Promise<WebsiteView[]> {
        const websiteView = await prisma.websiteView.findMany({
            where: { routeId },
        });
        return websiteView;
    }

    static async updateWebsiteView(id: string, data: {
        show: boolean;
        content: any;
    }): Promise<WebsiteView> {
        const websiteView = await prisma.websiteView.update({
            where: { id },
            data
        });
        return websiteView;
    }

    static async deleteWebsiteView(id: string): Promise<void> {
        await prisma.websiteView.delete({ where: { id } });
    }
}

export class WebRouteServices {
    static async createWebsiteRoute(data: {
        path: string;
        url: string;
    }): Promise<WebsiteRoute> {
        const websiteRoute = await prisma.websiteRoute.create({ data });
        return websiteRoute;
    }

    static async getWebsiteRoute(): Promise<WebsiteRoute[]> {
        const websiteRoute = await prisma.websiteRoute.findMany({});
        return websiteRoute;
    }

    static async getWebsiteRouteByUrl(url: string): Promise<WebsiteRoute | null> {
        const websiteRoute = await prisma.websiteRoute.findUnique({
            where: { url },
        });
        return websiteRoute;
    }

    static async getWebsiteRouteByPath(url: string, id: string | undefined): Promise<WebsiteRoute | null> {
        const websiteRoute = await prisma.websiteRoute.findFirst({
            where: {
                url,
                id: id ? { not: id } : undefined
            }
        });
        return websiteRoute;
    }

    static async getWebsiteRoutePath(path: string): Promise<WebsiteRoute | null> {
        const websiteRoute = await prisma.websiteRoute.findFirst({
            where: { path }
        });
        return websiteRoute;
    }

    static async updateWebsiteRoute(id: string, data: {
        path: string;
        url: string;
    }): Promise<WebsiteRoute> {
        const websiteRoute = await prisma.websiteRoute.update({
            where: { id },
            data
        });
        return websiteRoute;
    }

    static async getWebsiteRouteById(id: string): Promise<WebsiteRoute | null> {
        const websiteRoute = await prisma.websiteRoute.findUnique({
            where: { id },
        });
        return websiteRoute;
    }

    static async deleteWebsiteRoute(id: string): Promise<void> {
        await prisma.websiteRoute.delete({ where: { id } });
    }
}