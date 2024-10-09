import { prisma } from "../db/db.js";



export class FindUserByEmail {

    public static async findUser(email: string) {
        const isEmail = await prisma.user.findFirst({
            where: { email }
        });
        return isEmail ? isEmail : null;
    }
}