import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();
export const getAdminByEmail = async ({
    email
}) => {
    try {
        const existingUser = await prisma.admin.findUnique({
            where: { email }
        });
        return existingUser
    } catch (err) {
        throw new Error("Failed to get admin");
    }
}

export const createadmin = async ({ password, email, role }) => {
    try {
        if (role === 'superadmin') {
            const superadminExists = await prisma.admin.findFirst({
                where: { role: 'superadmin' }
            });

            if (superadminExists) {
                const error = new Error("super admin already exists");
                error.code = "superadmin_EXISTS";
                throw error;
            }
        }
        const existingAdmin = await getAdminByEmail({ email })

        if (existingAdmin) {
            const error = new Error("admin already exists");
            error.code = "admin_EXISTS"; // Custom code for controller
            throw error;
        }

        const adminData = await prisma.admin.create({
            data: {
                email,
                password,
                role
            }
        });

        return adminData;
    } catch (err) {
        if (err.code === 'admin_EXISTS') throw err;
        if (err.code === 'superadmin_EXISTS') throw err;
        // Otherwise, wrap other unexpected errors
        const error = new Error("Failed to create admin");
        error.original = err;
        throw error;
    }
}


export const updateAdminPassword = async ({ email, password }) => {
    try {
        const updatedAdmin = await prisma.admin.update({
            where: { email },
            data: {
                password: password
            }
        })
        return updatedAdmin
    } catch (err) {
        throw new Error("Failed to update password");
    }
}

export const updateAdminRefreshToken = async ({
    adminId, refreshToken, refreshTokenExpiryDate
}) => {
    try {
        const updatedAdmin = await prisma.admin.update({
            where: { adminId },
            data: {
                refreshToken,
                refreshTokenExpiry: refreshTokenExpiryDate
            }
        });
        return updatedAdmin;
    } catch (err) {
        // propagate error to controller and let middleware handle it
        throw new Error("Failed to update refresh token");
    }
};

export const deleteAdminRefreshToken = async ({
    adminId
}) => {
    try {

        const success = await prisma.admin.update({
            where: { adminId: adminId },
            data: {
                refreshToken: null,
                refreshTokenExpiry: null,
            }
        })
        return success
    } catch (err) {
        throw new Error("Failed to delete admin refreshtoken admin");
    }
}

export const adminDeleteUser = async ({
    email
}) => {
    try {

        const success = await prisma.userData.delete({
            where: { email: email }
        })

        return success
    } catch (err) {
        throw new Error("Failed to delete user");
    }
}
export const suspendUser = async ({
    email
}) => {
    try {
        const success = await prisma.userData.update({
            where: { email: email },
            data: {
                isSuspended: true,
                suspendedAt: new Date(),
                refreshToken: null,
                refreshTokenExpiry: null,
            }
        })
        return success
    } catch (err) {
        throw new Error("Failed to suspend user");
    }
}

export const createIndustry = async (industries) => {
    try {
        const success = await Promise.all(
            industries.map((title) =>
                prisma.industry.create({ data: { title } })
            )
        );
        return success;
    } catch (err) {
        throw new Error("Failed to upload industries");
    }

}

export const createskills = async (skills) => {
    try {
        const success = await Promise.all(
            skills.map((title) =>
                prisma.skills.create({ data: { title } })
            )
        );
        return success;
    } catch (err) {
        throw new Error("Failed to upload skills");
    }
}

export const deleteskills=async(id)=>{
    try{
       
    const success=await prisma.skills.delete({
          where: { skillsId : Number(id) }
    })
    return success
    }catch(err){
         throw new Error("Failed to delete skill");
    }
}
export const deleteindustry=async(id)=>{
    try{
    const success=await prisma.industry.delete({
          where: { industryId : Number(id) }
    })
    return success
    }catch(err){
         throw new Error("Failed to delete industry ");
    }
}
export const getAllReport = async ({ limit, offset }) => {
    try {
        const [reports, totalCount] = await Promise.all([
            prisma.userReports.findMany({
                orderBy: { createDate: 'desc' }, // match your schema field
                skip: Number(offset) || 0,
                take: Number(limit) || 10
            }),
            prisma.userReports.count()
        ]);

        return { reports, totalCount };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to get reports");
    }
};

export const GetallJobseeker = async ({ limit, offset, search, sort }) => {
    try {
        const whereCondition = search
            ? { name: { contains: search, mode: "insensitive" } }
            : {};

        let orderByCondition;
        if (sort === 'name_asc') {
            orderByCondition = { name: 'asc' };
        } else if (sort === 'name_desc') {
            orderByCondition = { name: 'desc' };
        } else if (sort === 'oldest') {
            orderByCondition = { createDate: 'asc' }; // match schema
        } else {
            orderByCondition = { createDate: 'desc' }; // match schema
        }

        const [jobseekers, totalCount] = await Promise.all([
            prisma.jobseekerProfile.findMany({
                where: whereCondition,
                orderBy: orderByCondition,
                take: Number(limit) || 10,
                skip: Number(offset) || 0,
            }),
            prisma.jobseekerProfile.count({ where: whereCondition }),
        ]);

        return { jobseekers, totalCount };
    } catch (err) {
        console.error(err); // log the real Prisma error
        throw new Error("Failed to get jobseeker");
    }
};


export const GetallCompany = async ({ limit, offset, search, sort, subscribed }) => {
    try {
        const whereCondition = {
            ...(search && {
                name: { contains: search, mode: "insensitive" }
            }),
            ...(subscribed !== undefined && {
                isSubscription: subscribed === 'true'
            })
        };

        // Match orderBy to your schema's actual date field
        let orderByCondition;
        if (sort === 'name_asc') {
            orderByCondition = { name: 'asc' };
        } else if (sort === 'name_desc') {
            orderByCondition = { name: 'desc' };
        } else if (sort === 'oldest') {
            orderByCondition = { createDate: 'asc' }; // adjust field name if needed
        } else {
            orderByCondition = { createDate: 'desc' }; // adjust field name if needed
        }

        const [companies, totalCount] = await Promise.all([
            prisma.companyProfile.findMany({
                where: whereCondition,
                orderBy: orderByCondition,
                take: Number(limit) || 10,
                skip: Number(offset) || 0,
            }),
            prisma.companyProfile.count({
                where: whereCondition,
            }),
        ]);

        return { companies, totalCount };
    } catch (err) {
        console.error("Prisma error in GetallCompany:", err);
        throw new Error("Failed to get companies");
    }
};

export const getCompanyDetails = async ({ companyId }) => {
    try {
        const companyDetails = await prisma.companyProfile.findUnique({
            where: { companyId: Number(companyId) }, // Ensure it's a number if needed
            include: {
                userData: true,
                photos: true,
                jobs: true,
            },
        });

        return companyDetails;
    } catch (err) {
        throw new Error("Failed to get company details");
    }
}
export const getJobseekerDetails = async ({ jobseekerId }) => {
    try {
        const jobseekerDetails = await prisma.jobseekerProfile.findUnique({
            where: { jobseekerProfileId: Number(jobseekerId) }, // confirm 'id' or use your PK field
            include: {
                userData: {
                    include: {
                        profilePic: true,
                    },
                },
                jobseekerSkills: true,
                jobseekerEducation: true,
                resume: true,
            },
        });
        return jobseekerDetails;
    } catch (err) {
        console.error("Error fetching jobseeker details:", err);
        throw new Error("Failed to get jobseeker details");
    }
};


export const GetallJobs = async ({ limit, offset, search, sort, premiumType }) => {
    try {
        const whereCondition = {};

        if (search) {
            whereCondition.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (premiumType !== undefined) {
            whereCondition.premiumType = premiumType;
        }

        let orderByCondition = { createDate: 'desc' };

        if (sort === 'title_asc') {
            orderByCondition = { title: 'asc' };
        } else if (sort === 'title_desc') {
            orderByCondition = { title: 'desc' };
        } else if (sort === 'oldest') {
            orderByCondition = { createDate: 'asc' };
        }


        const [jobs, totalCount] = await Promise.all([
            prisma.jobs.findMany({
                where: whereCondition,
                include: {
                    companyProfile: true,
                    jobIndustries: true,
                    jobResponsiblities: true, // Check spelling here
                    jobQualifications: true,
                    jobRequiredSkills: true,
                },
                orderBy: orderByCondition,
                skip: Number(offset) || 0,
                take: Number(limit) || 10,
            }),
            prisma.jobs.count({
                where: whereCondition,
            }),
        ]);

        return { jobs, totalCount };
    } catch (err) {
        console.error("Error in GetallJobs:", err);
        throw new Error("Failed to get all jobs");
    }
};


export const getJobDetails = async ({ jobId }) => {
    try {
        const jobDetails = await prisma.jobs.findUnique({
            where: { jobId: Number(jobId) },
            include: {
                companyProfile: true,
                jobIndustries: true,
                jobResponsiblities: true,  // use typo spelling as in schema
                jobQualifications: true,
                jobRequiredSkills: true,
            },
        });
        return jobDetails;
    } catch (err) {
        console.error("Failed to get job detail:", err);
        throw new Error("Failed to get job detail");
    }
};


export const deleteJobs = async ({ jobId }) => {
    try {

        const success = await prisma.jobs.delete({
            where: { jobId: jobId }
        })
        return success
    } catch (err) {
        throw new Error("Failed to delete job");
    }
}

export const getdashboardData = async () => {
    try {
        const [totalJobs, totalCompanies,paymentAggregate, totalApplication, totalJobseekers] = await Promise.all([
            prisma.jobs.count(),
            prisma.companyProfile.count(),
            prisma.payment.aggregate(
                {
                    _sum: {
                        amount: true,
                    },
                }),
            prisma.application.count(),
            prisma.jobseekerProfile.count()
        ]);
        const totalRevenue = paymentAggregate._sum?.amount || 0;


        return { totalJobs, totalCompanies, totalRevenue, totalApplication, totalJobseekers };

    } catch (err) {
        console.error(err);
        throw new Error("Failed to get dashboard data");
    }
};

