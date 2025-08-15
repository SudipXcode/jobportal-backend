import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();

export const createJobApplication = async (data) => {
    try {
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + 30); // Add 30 days from now

        const applicationPosted = await prisma.application.create({
            jobId: data.jobId,
            jobseekerProfileId: data.jobseekerProfileId,
            expiryTime: expiryDate,
            status: data.status
        })
        if (!applicationPosted) {
            throw new Error("Failed to create job application");
        }
        return applicationPosted
    } catch (err) {
        throw new Error("Failed to create job application");
    }
}

export const getJobApplication = async ({ limit, offset, search, sort }) => {
    try {
        // Search condition
        const whereCondition = search
            ? {
                OR: [
                    { status: { contains: search, mode: "insensitive" } },
                    {
                        jobseekerProfile: {
                            fullName: { contains: search, mode: "insensitive" }
                        }
                    },
                    {
                        job: {
                            companyProfile: {
                                companyName: { contains: search, mode: "insensitive" }
                            }
                        }
                    }
                ]
            }
            : {};

        // Sorting condition
        let orderByCondition;
        if (sort === 'status_asc') {
            orderByCondition = { status: 'asc' };
        } else if (sort === 'status_desc') {
            orderByCondition = { status: 'desc' };
        } else if (sort === 'oldest') {
            orderByCondition = { createdAt: 'asc' };
        } else {
            orderByCondition = { createdAt: 'desc' };
        }

        // Query applications + count in parallel
        const [applications, totalCount] = await Promise.all([
            prisma.application.findMany({
                where: whereCondition,
                orderBy: orderByCondition,
                take: Number(limit) || 20,
                skip: Number(offset) || 0,
                include: {
                    jobseekerProfile: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    },
                    job: {
                        select: {
                            id: true,
                            title: true,
                            companyProfile: {
                                select: {
                                    companyName: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.application.count({ where: whereCondition })
        ]);

        return { applications, totalCount };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to get job applications");
    }
};

export const getApplication = async (userId) => {
    try {
        const company = await prisma.companyProfile.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!company) {
            throw new Error("Company profile not found for this user");
        }
        const getApplication = await prisma.application.findMany({
            where: {
                job: {
                    companyId: company.id
                }
            },
            include: {
                jobseekerProfile: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        return getApplication
    } catch (err) {
        throw new Error("Failed to get job applications");
    }
}

export const updateJobApplication = async ({ id, status }) => {
    try {
        const updatedApplication = await prisma.application.update({
            where: { applicationId: id },
            data: {
                status: status
            },
            include: {
                jobseekerProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                job: {
                    select: {
                        title: true
                    }
                }
            }
        });

        return {
            jobseekerEmail: updatedApplication.jobseekerProfile.user.email,
            jobseekerName: updatedApplication.jobseekerProfile.user.name,
            jobTitle: updatedApplication.job.title,
            Jobstatus: updatedApplication.status
        };
    } catch (err) {
        throw new Error("Failed to update job applications");
    }
};

export const deleteApplication = async (id) => {
    try {
        const deletedApplication = await prisma.application.delete({
            where: { applicationId: id }
        })
        return deletedApplication
    } catch (err) {
        throw new Error("Failed to delete job applications");
    }
}

export const GetapplicationDetails = async (id) => {
    try {
        const [
            applicationDetail,
            resumeDetail,
            educationDetail,
            skillsDetail
        ] = await Promise.all([
            prisma.application.findFirst({
                where: { applicationId: id },
                select: {
                    status: true,
                    job: { select: { title: true } },
                    jobseekerProfile: {
                        select: {
                            userData: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    profilePic: { select: { profilePic: true } }
                                }
                            },
                            location: true,
                            mobileNumber: true,
                            dob: true,
                            gender: true
                        }
                    }
                }
            }),
            prisma.resume.findMany({
                where: { jobseekerProfile: { application: { some: { applicationId: id } } } },
                select: { resume: true }
            }),
            prisma.jobseekerEducation.findMany({
                where: { jobseekerProfile: { application: { some: { applicationId: id } } } },
                select: { education: true, course: true }
            }),
            prisma.jobseekerSkills.findMany({
                where: { jobseekerProfile: { application: { some: { applicationId: id } } } },
                select: { skills: { select: { skillName: true } } }
            })
        ]);

        return {
            application: [applicationDetail], // make single object into array
            resume: resumeDetail,             // already array
            education: educationDetail,       // already array
            skills: skillsDetail.map(s => s.skills.skillName) // array of names
        };
    } catch (err) {
        throw new Error("Failed to get application details");
    }
};

