import { mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { prisma } from "../../infra/prisma";
import { MAX_MOD_FILE_BYTES } from "../../config/constants";
import { auditService } from "../audit/audit.service";

const modDirectory = resolve(import.meta.dir, "../../../data/mods");
const allowedExtensions = new Set([".zip", ".7z", ".rar"]);

export class ModUploadError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = "ModUploadError";
        this.statusCode = statusCode;
    }
}

export class ModsService {
    async list(userId: string) {
        return prisma.uploadedMod.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                originalName: true,
                extension: true,
                sizeBytes: true,
                createdAt: true,
            },
        });
    }

    async upload(userId: string, file: File) {
        const extension = extname(file.name).toLowerCase();
        if (!allowedExtensions.has(extension)) {
            throw new ModUploadError("Поддерживаются архивы ZIP, 7Z и RAR.", 400);
        }
        if (file.size === 0) {
            throw new ModUploadError("Выбранный файл пустой.", 400);
        }
        if (file.size > MAX_MOD_FILE_BYTES) {
            throw new ModUploadError("Размер архива не должен превышать 50 МБ.", 413);
        }

        const originalName = basename(file.name).slice(0, 255);
        const name = originalName.slice(0, -extension.length).trim().slice(0, 100) || "Новый мод";
        const id = crypto.randomUUID();
        const fileKey = `${id}${extension}`;
        const filePath = join(modDirectory, fileKey);

        await mkdir(modDirectory, { recursive: true });
        await writeFile(filePath, new Uint8Array(await file.arrayBuffer()), { flag: "wx" });

        let mod;
        try {
            mod = await prisma.uploadedMod.create({
                data: {
                    id,
                    userId,
                    name,
                    originalName,
                    fileKey,
                    extension,
                    sizeBytes: file.size,
                },
                select: {
                    id: true,
                    name: true,
                    originalName: true,
                    extension: true,
                    sizeBytes: true,
                    createdAt: true,
                },
            });
        } catch (error) {
            await unlink(filePath).catch(() => undefined);
            throw error;
        }

        await auditService.add(userId, "mod_uploaded", `Загружен мод «${mod.name}»`);
        return mod;
    }

    async remove(userId: string, id: string) {
        const mod = await prisma.uploadedMod.findFirst({ where: { id, userId } });
        if (!mod) return false;

        const filePath = join(modDirectory, mod.fileKey);
        try {
            await unlink(filePath);
        } catch (error) {
            if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
                throw error;
            }
        }

        await prisma.uploadedMod.deleteMany({ where: { id, userId } });
        await auditService.add(userId, "mod_deleted", `Удалён мод «${mod.name}»`);
        return true;
    }
}

export const modsService = new ModsService();
