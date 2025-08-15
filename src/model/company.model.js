import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();

export const createCompanyProfile = async ({ userId, data }) => {
    try {
        const existingProfile = await prisma.companyProfile.findUnique({
            where: { userId }
        });

        if (existingProfile) {
            const error = new Error("Company profile already exists");
            error.code = "PROFILE_EXISTS";
            throw error;
        }

        const userData = await prisma.companyProfile.create({
            data: {
                userId: userId,
                ...data
            }
        });

        return userData;
    } catch (err) {
        throw new Error("Failed to create company profile");
    }
}

export const getCompanyProfile = async ({ userId }) => {
    try {

        const companyProfileDetails = await prisma.companyProfile.findFirst({
            where: { userId },
            include: {
                userData: {
                    include: {
                        profilePic: true
                    }
                },
                photos: true,

            }
        });

        if (!companyProfileDetails) {
            throw new Error("Company profile not found");
        }

        return companyProfileDetails;
    } catch (err) {
        throw new Error("Failed to fetch company profile");
    }
};

export const updateCompanyProfile = async ({ companyId, data }) => {
    try {
        // Optional: Check if company profile exists
        const existingProfile = await prisma.companyProfile.findUnique({
            where: { companyId }
        });

        if (!existingProfile) {
            throw new Error("Company profile not found");
        }

        // Update the company profile
        const companyProfile = await prisma.companyProfile.update({
            where: { companyId },
            data
        });

        return companyProfile;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to update company profile");
    }
};
