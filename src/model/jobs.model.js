import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();

export const postJobs = async ({
    userId,
    title,
    location,
    salary,
    role,
    employmentType,
    desc,
    premiumType,
    industryId, // array of industry IDs
    jobResponsiblities, // array of responsibility titles
    jobQualifications,  // array of qualification titles
    skillsId // array of skill IDs
}) => {
    try {
        const company = await prisma.companyProfile.findUnique({
            where: { userId }, // userId is FK here
            select: { companyId: true }
        });
        if (!company) {
            throw new Error("Company profile not found for this user");
        }
        const success = await prisma.jobs.create({
            data: {

                title,
                location,
                salary,
                role,
                employmentType,
                desc,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Example: 30 days from now
                companyId: company.companyId,
                premiumType,

                // Create related records
                jobIndustries: {
                    create: industryId.map(id => ({
                        industryId: id
                    }))
                },
                jobResponsiblities: {
                    create: jobResponsiblities.map(res => ({
                        title: res
                    }))
                },
                jobQualifications: {
                    create: jobQualifications.map(qual => ({
                        title: qual
                    }))
                },
                jobRequiredSkills: {
                    create: skillsId.map(sid => ({
                        skillsId: sid
                    }))
                }
            },
            include: {
                jobIndustries: true,
                jobResponsiblities: true,
                jobQualifications: true,
                jobRequiredSkills: true
            }
        });

        return success;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to post job");
    }
};

export const updateJob = async ({ id, data }) => {
    try {
        if (!id || !data) {
            throw new Error("Job id and data are required for update");
        }

        // Extract arrays from data or default empty arrays
        const {
            industryId = [],
            jobResponsiblities = [],
            jobQualifications = [],
            skillsId = [],
            ...jobFields // other job fields like title, location, salary etc.
        } = data;

        // Use a transaction to keep data consistent
        const result = await prisma.$transaction(async (prisma) => {
            // Update the main job fields
            const updatedJob = await prisma.jobs.update({
                where: { jobId: Number(id) },
                data: {
                    ...jobFields
                }
            });

            // Clear old related entries first
            await prisma.jobIndustries.deleteMany({ where: { jobId: Number(id) } });
            await prisma.jobResponsiblities.deleteMany({ where: { jobId: Number(id) } });
            await prisma.jobQualifications.deleteMany({ where: { jobId: Number(id) } });
            await prisma.jobRequiredSkills.deleteMany({ where: { jobId: Number(id) } });

            // Recreate new related entries
            if (industryId.length) {
                await prisma.jobIndustries.createMany({
                    data: industryId.map(indId => ({ jobId: Number(id), industryId: indId }))
                });
            }
            if (jobResponsiblities.length) {
                await prisma.jobResponsiblities.createMany({
                    data: jobResponsiblities.map(title => ({ jobId: Number(id), title }))
                });
            }
            if (jobQualifications.length) {
                await prisma.jobQualifications.createMany({
                    data: jobQualifications.map(title => ({ jobId: Number(id), title }))
                });
            }
            if (skillsId.length) {
                await prisma.jobRequiredSkills.createMany({
                    data: skillsId.map(skillId => ({ jobId: Number(id), skillsId: skillId }))
                });
            }

            return updatedJob;
        });

        return result;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to update job");
    }
};

export const deleteJob = async (id) => {
    try {
        if (!id) {
            throw new Error("Job id is required for deletion");
        }

        const deletedJob = await prisma.jobs.delete({
            where: { jobId: Number(id) }
        });

        return deletedJob;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to delete job");
    }
};

export const getAllJobs = async ({ offset, search, sort, jobLocation, industry }) => {
    try {
        const whereClause = {
            AND: [
                search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                    : {},
                jobLocation ? { jobLocation: { equals: jobLocation, mode: 'insensitive' } } : {},
                industry ? { industry: { equals: industry, mode: 'insensitive' } } : {}
            ]
        };

        const [jobs, totalJobs] = await Promise.all([
            prisma.jobs.findMany({
                where: whereClause,
                orderBy: { createdAt: sort },
                skip: offset,
                take: limit
            }),
            prisma.jobs.count({ where: whereClause })
        ]);

        return { jobs, totalJobs };

    } catch (err) {
        throw new Error("Failed to get all jobs");
    }
}

export const getAllCompanies = async ({ offset, search, companyLocation, industry }) => {
    try {
        const whereClause = {
            AND: [
                search
                    ? {
                        companyName: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                    : {},
                companyLocation
                    ? {
                        companyLocation: {
                            contains: companyLocation,
                            mode: 'insensitive'
                        }
                    }
                    : {},
                industry
                    ? {
                        industry: {
                            contains: industry,
                            mode: 'insensitive'
                        }
                    }
                    : {}
            ]
        };

        const companies = await prisma.companyProfile.findMany({
            where: whereClause,
            skip: offset,
            take: 20, // keep pagination consistent with controller's limit
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalCompanies = await prisma.companyProfile.count({
            where: whereClause
        });

        return [companies, totalCompanies];
    } catch (err) {
        throw new Error("Failed to get all company");
    }
};



export const getcompanyDetails = async (id) => {
    try {
        const companyDetails = await prisma.companyProfile.findFirst({
            where: { companyId: id },
            include: {
                jobs: {
                    orderBy: { createdAt: 'desc' }
                },
                reviews: true, // if you have a reviews relation
                _count: {
                    select: {
                        jobs: true,

                    }
                }
            }
        });

        return companyDetails;
    } catch (err) {
        throw new Error("Failed to get company details");
    }
};

export const getJobDetails = async (id) => {
    try {
        const jobDetails = await prisma.jobs.findFirst({
            where: { jobId: id },
            include: {
                jobIndustries: true,
                jobResponsiblities: true,
                jobQualifications: true,
                jobRequiredSkills: true,
                companyProfile: {
                    include: {
                        userData: true
                    }
                }
            }
        })

        return jobDetails
    } catch (err) {
        throw new Error("Failed to get company details");
    }
}