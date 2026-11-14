import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/prisma";
import { auditService } from "../audit/audit.service";

const presetFields = {
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
} satisfies Prisma.SessionPresetSelect;

type PresetRecord = Prisma.SessionPresetGetPayload<{ select: typeof presetFields }>;

function toSessionPreset(preset: PresetRecord) {
    return { ...preset, cars: preset.cars.map(({ car }) => car) };
}

export interface SessionPresetInput {
    name: string;
    track: string;
    trackConfig: string;
    mode: string;
    slots: number;
    cars: string[];
    practiceMinutes: number;
    qualifyingMinutes: number;
    raceLaps: number;
    weather: string;
    timeOfDay: string;
}

export class PresetsService {
    async list(userId: string) {
        const presets = await prisma.sessionPreset.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: presetFields,
        });
        return presets.map(toSessionPreset);
    }

    async create(userId: string, input: SessionPresetInput) {
        const { cars, ...settings } = input;
        const record = await prisma.sessionPreset.create({
            data: {
                ...settings,
                userId,
                cars: { create: [...new Set(cars)].map((car) => ({ car })) },
            },
            select: presetFields,
        });
        const preset = toSessionPreset(record);
        await auditService.add(userId, "preset_created", `Создан пресет «${preset.name}»`);
        return preset;
    }

    async update(userId: string, id: string, input: Partial<SessionPresetInput>) {
        const { cars, ...settings } = input;
        const record = await prisma.$transaction(async (transaction) => {
            const current = await transaction.sessionPreset.findFirst({
                where: { id, userId },
                select: { id: true },
            });
            if (!current) return null;

            await transaction.sessionPreset.update({ where: { id }, data: settings });

            if (cars !== undefined) {
                await transaction.presetCar.deleteMany({ where: { presetId: id } });
                await transaction.presetCar.createMany({
                    data: [...new Set(cars)].map((car) => ({ presetId: id, car })),
                });
            }

            return transaction.sessionPreset.findFirst({ where: { id, userId }, select: presetFields });
        });
        if (!record) return null;

        const preset = toSessionPreset(record);
        await auditService.add(userId, "preset_updated", `Изменён пресет «${preset.name}»`);
        return preset;
    }

    async remove(userId: string, id: string) {
        const preset = await prisma.sessionPreset.findFirst({ where: { id, userId } });
        if (!preset) return false;

        await prisma.sessionPreset.deleteMany({ where: { id, userId } });
        await auditService.add(userId, "preset_deleted", `Удалён пресет «${preset.name}»`);
        return true;
    }
}

export const presetsService = new PresetsService();
