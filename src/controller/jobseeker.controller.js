import { getProfilePicture, createProfilePic, CreateReportIssue, DeleteJobPreferences, createJobPreferences, createResume, updateJobseekerResume, createJobseekerProfile, getJobseekerProfile, updateJobseekerProfile, createJobseekerProfileDetils, updateJobseekerEducation, createJobseekerProfileSkills } from '../model/jobseeker.model.js'
import { uploadFileToCloudinary, deleteFileFromCloudinary } from '../util/cloudinary.util.js'
export const handleCreateJobseekerProfile = async (req, res, next) => {
    try {
        const data = req.body;
        const decoded = req.user;
        const photo = req.file
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can create a jobseekker profile",
                success: false,
            });
        }
        const jobseekerProfile = await createJobseekerProfile({
            userId: decoded.userId,
            data
        });
        const profilePicUrl = await uploadFileToCloudinary({ photo, userId })
        const profilePic = await createProfilePic({ url: profilePicUrl.secure_url, userId: decoded.userId })

        return res.status(201).json({
            message: "Jobseeker profile created successfully",
            success: true,
            data: { profilePic, jobseekerProfile }
        });
    } catch (err) {
        if (err.code === 'PROFILE_EXISTS') {
            return res.status(409).json({ success: false, error: 'jobseeker profile already exists' });
        }
        return next(err);
    }
}

export const handleGetJobseekerprofile = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can get a jobseeker profile",
                success: false,
            });
        }

        const jobseekerProfileDetails = await getJobseekerProfile({
            userId
        });

        if (!jobseekerProfileDetails) {
            return res.status(401).json({ success: false, error: 'jobseeker profile not found' });
        }

        return res.status(200).json({
            message: "jobseeksr profile fetch successfully",
            success: true,
            data: jobseekerProfileDetails
        });
    } catch (err) {
        return next(err);
    }
}

export const handleUpdateJobseekerProfile = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        const data = req.body
        const photo = req.file
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can get a jobseeker profile",
                success: false,
            });
        }

        const updatedProfile = await updateJobseekerProfile({
            userId, data
        });
        if (!updatedProfile) {
            return res.status(401).json({ success: false, error: 'error updating jobseeker profile ' });
        }
        const existingProfile = await getProfilePicture(userId)
        if (!existingProfile) {
            return res.status(404).json({
                message: "Jobseeker profile not found",
                success: false,
            });
        }
        let profilePicUrl = existingProfile.profilePic;
        if (photo) {
            // Delete old photo from Cloudinary if exists
            if (profilePicUrl) {
                await deleteFileFromCloudinary("photo", userId);
            }

            // Upload new photo to Cloudinary
            const uploadResult = await uploadFileToCloudinary({ photo, userId });
            profilePicUrl = uploadResult.secure_url;
        }
        const profilePic = await createProfilePic({ url: profilePicUrl, userId: decoded.userId })

        return res.status(200).json({
            message: "jobseeksr profile updated successfully",
            success: true,
            data: { updatedProfile, profilePic }
        });
    } catch (err) {
        return next(err);
    }
}
export const handleCreateJobseekerDetails = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        const data = req.body
        const resume = req.file
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const { createdEducations, createdSkills } = await createJobseekerProfileDetils({
            userId, data
        });

        if (!createdEducations || !createdSkills) {
            return res.status(401).json({ success: false, error: 'fail to create jobseeker details' });
        }
        const resumeUrl = await uploadFileToCloudinary({ resume, userId })
        const resumeResult = await createResume({ url: resumeUrl.secure_url, userId: decoded.userId })

        return res.status(200).json({
            message: "jobseeksr profile fetch successfully",
            success: true,
            data: { createdEducations, createdSkills, resumeResult }
        });

    } catch (err) {
        return next(err);
    }
}

export const handleUpdateJobseekerEducation = async (req, res, next) => {
    try {
        const decoded = req.user;
        const educationdetails = req.body
        const { id } = req.params;

        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const updateEducationDetails = await updateJobseekerEducation({
            educationdetails, id
        });

        if (!updateEducationDetails) {
            return res.status(401).json({ success: false, error: 'fail to create jobseeker educ' });
        }
        return res.status(200).json({
            message: "jobseeksr education update successfully",
            success: true,
            data: updateEducationDetails
        });
    } catch (err) {
        return next(err);
    }
}

export const handlecreateJobseekerSkills = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        const skillsId = req.body

        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const skillsInserted = await createJobseekerProfileSkills({
            userId, skillsId
        });
        if (!skillsInserted || skillsInserted.skillsInserted === 0) {
            return res.status(401).json({ success: false, error: 'fail to create jobseeker skills' });
        }
        return res.status(200).json({
            message: "jobseeksr skills create successfully",
            success: true,
            data: skillsInserted
        });
    } catch (err) {
        return next(err);
    }
}
export const handleUpdateResume = async (req, res, next) => {
    try {
        const decoded = req.user;
        const resume = req.body
        const userId = decoded.userId
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const existingProfile = await getJobseekerProfile(userId)
        if (!existingProfile) {
            return res.status(404).json({
                message: "Jobseeker profile not found",
                success: false,
            });
        }
        let resumeUrl = existingProfile.resume
        if (resume) {
            // Delete old photo from Cloudinary if exists
            if (resumeUrl) {
                await deleteFileFromCloudinary("resume", userId);
            }

            // Upload new photo to Cloudinary
            const uploadResult = await uploadFileToCloudinary({ resume, userId });
            resumeUrl = uploadResult.secure_url;
        }
        const resumeUpdated = await updateJobseekerResume({
            url: resumeUrl, userId
        });
        if (!resumeUpdated) {
            return res.status(401).json({ success: false, error: 'fail to update jobseeker resume' });
        }
        return res.status(200).json({
            message: "jobseeksrresume updated successfully",
            success: true,
            data: resumeUpdated
        });
    } catch (err) {
        return next(err);
    }
}

export const handleJobPreferences = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        const { industry } = req.body

        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const preferenceInserted = await createJobPreferences({ userId, industry })
        if (!preferenceInserted) {
            return res.status(401).json({ success: false, error: 'fail to post jobseeker jobpreferences' });
        }
        return res.status(200).json({
            message: " jobseeker jobpreferences posted successfully",
            success: true,
            data: preferenceInserted
        });
    } catch (err) {
        return next(err);
    }
}

export const handleDeleteJobPreferences = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { id } = req.params;
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const deleteJobPreferences = await DeleteJobPreferences({ id })
        if (!deleteJobPreferences) {
            return res.status(401).json({ success: false, error: 'fail to delete jobseeker jobpreferences' });
        }
        return res.status(200).json({
            message: " jobseeker jobpreference deleted successfully",
            success: true,
            data: deleteJobPreferences
        });
    } catch (err) {
        return next(err);
    }
}
export const handleCreateReportIssue = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { companyId, issue } = req.body;
        const userId = decoded.userId;
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can post a jobseeker profile",
                success: false,
            });
        }
        const reportPosted = await CreateReportIssue({ userId, companyId, issue })

        if (!reportPosted) {
            return res.status(401).json({ success: false, error: 'fail to create report issue' });
        }
        return res.status(200).json({
            message: " report issue created successfully",
            success: true,
            data: reportPosted
        });
    } catch (err) {
        return next(err);
    }
}

