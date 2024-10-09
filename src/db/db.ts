// prismaClient.ts
import { PrismaClient } from "@prisma/client";

export let prisma: PrismaClient;

export const getPrismaClient = ()=> {
    try {
        if (!prisma) {
            prisma = new PrismaClient()
        }
        console.log('Connection established')
        return prisma;
    } catch (error) {
        console.error("Error initializing Prisma client", error);
    }
};


