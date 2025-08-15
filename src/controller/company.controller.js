import { createCompanyProfile, getCompanyProfile, updateCompanyProfile } from '../model/company.model.js'
import { getProfilePicture, createProfilePic } from '../model/jobseeker.model.js'

export const handleCreateCompanyProfile = async (req, res, next) => {
    try {
        const data = req.body;
        const decoded = req.user;
        const photo = req.file
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Forbidden: Only company accounts can create a company profile",
                success: false,
            });
        }

        const companyProfile = await createCompanyProfile({
            userId: decoded.userId,
            data
        });
        const profilePicUrl = await uploadFileToCloudinary({ photo, userId })
        const profilePic = await createProfilePic({ url: profilePicUrl.secure_url, userId: decoded.userId })

        return res.status(201).json({
            message: "Company profile created successfully",
            success: true,
            data: { companyProfile, profilePic }
        });
    } catch (err) {
        if (err.code === 'PROFILE_EXISTS') {
            return res.status(409).json({ success: false, error: 'company profile already exists' });
        }
        return next(err);
    }
}

export const handleGetCompanyProfile = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Forbidden: Only company accounts can get a company profile",
                success: false,
            });
        }

        const companyProfileDetails = await getCompanyProfile({
            userId
        });

        if (!companyProfileDetails) {
            return res.status(401).json({ success: false, error: 'company profile not found' });
        }

        return res.status(200).json({
            message: "company profile fetch successfully",
            success: true,
            data: companyProfileDetails
        });
    } catch (err) {
        return next(err);
    }
}

export const handleUpdateCompanyProfile = async (req, res, next) => {
    try {
        const data = req.body;
        const decoded = req.user;
        const { companyId } = req.params
        const photo = req.file
        const userId = decoded.userId
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Forbidden: Only company accounts can update a company profile",
                success: false,
            });
        }

        const companyProfile = await updateCompanyProfile({
            companyId,
            data
        });
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

        return res.status(201).json({
            message: "Company profile updated successfully",
            success: true,
            data: { companyProfile, profilePic }
        });
    } catch (err) {
        return next(err);
    }
}