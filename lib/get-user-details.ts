import prisma from "./prisma";

async function getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    return user;
}

export default getUserDetails;