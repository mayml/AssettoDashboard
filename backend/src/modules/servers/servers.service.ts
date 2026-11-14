import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/prisma";
import { auditService } from "../audit/audit.service";

const serverFields = {
    id: true,
    name: true,
    track: true,
    trackConfig: true,
    mode: true,
    slots: true,
    practiceMinutes: true,
    qualifyingMinutes: true,
    raceLaps: true,
    weather: true,
    timeOfDay: true,
    createdAt: true,
    updatedAt: true,
    cars: { select: { car: true } },
} satisfies Prisma.ServerConfigSelect;

type ServerRecord = Prisma.ServerConfigGetPayload<{ select: typeof serverFields }>;

function toServerConfig(server: ServerRecord) {
    return { ...server, cars: server.cars.map(({ car }) => car) };
}

export interface ServerConfigInput {
    name: string;
    track: string;
    trackConfig: string;
    mode: string;
    slots: number;
    practiceMinutes: number;
    qualifyingMinutes: number;
    raceLaps: number;
    cars: string[];
    weather: string;
    timeOfDay: string;
}

export class ServersService {
    async list(userId: string) {
        const servers = await prisma.serverConfig.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: serverFields,
        });
        return servers.map(toServerConfig);
    }

    async create(userId: string, input: ServerConfigInput) {
        const { cars, ...settings } = input;
        const record = await prisma.serverConfig.create({
            data: {
                ...settings,
                userId,
                cars: { create: [...new Set(cars)].map((car) => ({ car })) },
            },
            select: serverFields,
        });
        const server = toServerConfig(record);
        await auditService.add(userId, "server_created", `Сохранена конфигурация «${server.name}»`);
        return server;
    }

    async update(userId: string, id: string, input: Partial<ServerConfigInput>) {
        const { cars, ...settings } = input;
        const record = await prisma.$transaction(async (transaction) => {
            const current = await transaction.serverConfig.findFirst({
                where: { id, userId },
                select: { id: true },
            });
            if (!current) return null;

            await transaction.serverConfig.update({ where: { id }, data: settings });

            if (cars !== undefined) {
                await transaction.serverConfigCar.deleteMany({ where: { serverConfigId: id } });
                await transaction.serverConfigCar.createMany({
                    data: [...new Set(cars)].map((car) => ({ serverConfigId: id, car })),
                });
            }

            return transaction.serverConfig.findFirst({ where: { id, userId }, select: serverFields });
        });
        if (!record) return null;

        const server = toServerConfig(record);
        await auditService.add(userId, "server_updated", `Изменена конфигурация «${server.name}»`);
        return server;
    }

    async remove(userId: string, id: string) {
        const server = await prisma.serverConfig.findFirst({ where: { id, userId } });
        if (!server) return false;

        await prisma.serverConfig.deleteMany({ where: { id, userId } });
        await auditService.add(userId, "server_deleted", `Удалена конфигурация «${server.name}»`);
        return true;
    }
}

export const serversService = new ServersService();
