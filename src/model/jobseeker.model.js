import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();


export const createProfilePic = async ({ url, userId }) => {
    try {
        const profilePic = await prisma.profilePic.create({
            data: {
                userId: userId,
                profilePic: url
            }
        })
        return profilePic;
    } catch (err) {
        throw new Error("Failed to create profile picture");
    }
}

export const getProfilePicture = async (userId) => {
    try {
        const existingProfile = await prisma.profilePic.findFirst({
            where: { userId: userId }
        })

        return existingProfile
    } catch (err) {
        throw new Error("Failed to get profile picture");
    }
}

export const createJobseekerProfile = async ({ userId, data }) => {

    try {
        const existingProfile = await prisma.jobseekerProfile.findUnique({
            where: { userId }
        });

        if (existingProfile) {
            const error = new Error("jobseeker profile already exists");
            error.code = "PROFILE_EXISTS";
            throw error;
        }

        const userData = await prisma.jobseekerProfile.create({
            data: {
                userId: userId,
                ...data
            }
        });

        return userData;
    } catch (err) {
        throw new Error("Failed to create jobseeker profile");
    }
}

export const getJobseekerProfile = async ({ userId }) => {
    try {
        const jobseekerProfileDetails = await prisma.jobseekerProfile.findFirst({
            where: { userId },
            include: {
                userData: {
                    include: {
                        profilePic: true
                    }
                },
                JobseekerSkills: true,
                resume: true,
                jobseekerEducation: true,
                jobPreferences: true
            }
        });

        if (!jobseekerProfileDetails) {
            throw new Error("jobseeker profile not found");
        }
        return jobseekerProfileDetails;
    } catch (err) {
        throw new Error("Failed to fetch jobseeker profile");
    }
}

export const updateJobseekerProfile = async ({ userId, data }) => {
    try {
        // Check if the profile exists
        const existingProfile = await prisma.jobseekerProfile.findUnique({
            where: { userId }
        });

        if (!existingProfile) {
            const error = new Error("Jobseeker profile not found");
            error.code = "PROFILE_NOT_FOUND";
            throw error;
        }

        // Update the existing profile
        const updatedProfile = await prisma.jobseekerProfile.update({
            where: { userId },
            data: {
                ...data
            }
        });

        return updatedProfile;

    } catch (err) {
        console.error(err);
        throw new Error("Failed to update jobseeker profile");
    }
};

export const createJobseekerProfileDetils = async ({ userId, data }) => {
    try {
        const jobseekerProfile = await prisma.jobseekerProfile.findUnique({
            where: { userId },
            select: { jobseekerProfileId: true }
        });

        if (!jobseekerProfile) {
            throw new Error("jobseeker profile not found for this user");
        }

        const jobseekerProfileId = jobseekerProfile.jobseekerProfileId;

        // Step 2 & Step 3 in parallel
        const [createdEducations, createdSkills] = await Promise.all([
            data.jobseekerEducation?.length
                ? prisma.jobseekerEducation.createMany({
                    data: data.jobseekerEducation.map(edu => ({
                        jobseekerProfileId,
                        education: edu.education,
                        course: edu.course
                    }))
                })
                : Promise.resolve({ count: 0 }),

            data.skills?.length
                ? prisma.jobseekerSkills.createMany({
                    data: data.skills.map(skillId => ({
                        jobseekerProfileId,
                        skillsId: skillId
                    }))
                })
                : Promise.resolve({ count: 0 })
        ]);

        if (!createdEducations || !createdSkills) {
            throw new Error("fail to create jobseeker profile details");
        }
        return { createdEducations, createdSkills }
    } catch (err) {
        throw new Error("Failed to post jobseeker profile details");
    }
}

export const updateJobseekerEducation = async ({ educationdetails, id }) => {

    try {

        if (!id || !educationdetails) {
            throw new Error("ecaution details and id is need");
        }
        const updateEducationDetails = await prisma.jobseekerEducation.update({
            where: { jobseekerEducationId: Number(id) },
            data: {
                education: educationdetails.education,
                course: educationdetails.course,
            }
        });

        if (!updateEducationDetails) {
            throw new Error("Failed to update jobseker education detail");
        }

        return updateEducationDetails
    } catch (err) {
        throw new Error("Failed to post jobseeker profile details");
    }

}

export const createJobseekerProfileSkills = async ({ userId, skillsId }) => {
    try {
        const jobseekerProfile = await prisma.jobseekerProfile.findUnique({
            where: { userId },
            select: { jobseekerProfileId: true }
        });

        if (!jobseekerProfile) {
            throw new Error("Jobseeker profile not found for this user");
        }

        const jobseekerProfileId = jobseekerProfile.jobseekerProfileId;

        if (!skillsId || !skillsId.length) {
            throw new Error("skills need");
        }

        const createSkills = await prisma.jobseekerSkills.createMany({
            data: skillsId.map(skillId => ({
                jobseekerProfileId,
                skillsId: skillId
            })),
            skipDuplicates: true
        });

        if (createSkills.count === 0) {
            throw new Error("Failed to create jobseeker skills");
        }

        return {

            skillsInserted: createSkills.count
        };
    } catch (err) {
        throw new Error(err.message || "Failed to post jobseeker profile skills");
    }
};
export const createResume = async ({ url, userId }) => {
    try {
        const resumeResult = await prisma.resume.create({
            data: {
                resume: url,
                userId: userId
            }
        })
        return resumeResult
    } catch (err) {
        throw new Error("Failed to create jobskker resume ");
    }
}
export const updateJobseekerResume = async ({ url, userId }) => {
    try {
        const resumeUpdated = await prisma.resume.update({
            where: { userId: userId },
            data: {
                resume: url
            }
        })
        return resumeUpdated

    } catch (err) {
        throw new Error("Failed to update jobskker resume ");
    }
}
export const createJobPreferences = async ({ userId, industry }) => {
    try {
        const jobseekerProfile = await prisma.jobseekerProfile.findUnique({
            where: { userId },
            select: { jobseekerProfileId: true }
        });

        if (!jobseekerProfile) {
            throw new Error("Jobseeker profile not found for this user");
        }

        const jobseekerProfileId = jobseekerProfile.jobseekerProfileId;
        const postJobpreferences = await prisma.jobPreferences.createMany({
            data: industry.map(industryId => ({
                jobseekerProfileId,
                industryId: industryId
            })),
            skipDuplicates: true
        });
        if (postJobpreferences.count === 0) {
            throw new Error("Failed to create jobseeker jobpreference");
        }

        return {

            preferenceInserted: postJobpreferences.count
        };
    } catch (err) {
        throw new Error("Failed to post jobsseeker jobpreferences ");
    }
}


export const DeleteJobPreferences = async ({ id }) => {
    try {
        const deleteJobPreferences = await prisma.jobPreferences.delete({
            where: {
                jobPreferencesId: Number(id) // must be an object, not an assignment
            }
        });

        return deleteJobPreferences;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to delete jobseeker job preferences");
    }
};

export const CreateReportIssue = async ({ userId, companyId, issue }) => {
    try {
        const jobseekerProfile = await prisma.jobseekerProfile.findUnique({
            where: { userId },
            select: { jobseekerProfileId: true }
        });

        if (!jobseekerProfile) {
            throw new Error("Jobseeker profile not found for this user");
        }

        const jobseekerProfileId = jobseekerProfile.jobseekerProfileId;
        const reportPosted = await prisma.userReports.create({
            data: {
                jobseekerProfileId: jobseekerProfileId,
                companyId: companyId,
                issue: issue
            }
        })

        return reportPosted
    } catch (err) {
        throw new Error("Failed to post report issue");
    }
}