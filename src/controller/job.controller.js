import { postJobs, updateJob, deleteJob, getAllJobs, getAllCompanies, getcompanyDetails, getJobDetails } from '../model/jobs.model.js'
import { getRecommendedJobsService } from '../service/recommendedJobs.service.js'
export const handleCreateJob = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { title, location, salary, role, employmentType, desc, premiumType, industryId, jobResponsiblities, jobQualifications, skillsId } = req.body
        if (!decoded.userId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }
        if (decoded.role !== "company") {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        const jobPosted = await postJobs({ userId: decoded.userId, title, location, salary, role, employmentType, desc, premiumType, industryId, jobResponsiblities, jobQualifications, skillsId })
        if (!jobPosted) {
            return res.status(401).json({ success: false, error: 'Fail to post job' })
        }

        return res.status(200).json({ success: true, message: "job posted successfully" })
    } catch (err) {
        return next(err)
    }
}
export const handleUpdateJob = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { id } = req.params;
        const data = req.body;
        if (!decoded.userId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }
        if (decoded.role !== "company") {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const updateJobs = await updateJob({ id, data })
        if (!updateJobs) {
            return res.status(401).json({ success: false, error: 'Fail to update job' })
        }

        return res.status(200).json({ success: true, message: "job updated successfully" })
    } catch (err) {
        return next(err)
    }
}
export const handleDeleteJob = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { id } = req.params;

        if (!decoded.userId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }
        if (decoded.role !== "company") {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        const deleteJobs = await deleteJob(id)
        if (!deleteJobs) {
            return res.status(401).json({ success: false, error: 'Fail to delete job' })
        }

        return res.status(200).json({ success: true, message: "job deelte successfully" })
    } catch (err) {
        return next(err)
    }
}
export const handleGetAllJobs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Search & sort
        const search = req.query.search?.trim() || '';
        const sort = req.query.sort === 'oldest' ? 'asc' : 'desc';

        // Advanced filters
        const jobLocation = req.query.jobLocation?.trim();
        const industry = req.query.industry?.trim();



        const [jobs, totalJobs] = await getAllJobs({ offset, search, sort, jobLocation, industry })

        if (totalJobs === 0) {
            return res.status(401).josn({ success: false, message: "No job found" })
        }
        return res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                total: totalJobs,
                page,
                limit,
                totalPages: Math.ceil(totalJobs / limit)
            }
        });

    } catch (err) {
        return next(err);
    }
};

export const handleGetAllCompanies = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Search & sort
        const search = req.query.search?.trim() || '';

        // Advanced filters
        const companyLocation = req.query.companyLocation?.trim();
        const industry = req.query.industry?.trim();



        const [companies, totalCompanies] = await getAllCompanies({ offset, search, companyLocation, industry })

        if (totalCompanies === 0) {
            return res.status(401).josn({ success: false, message: "No company found" })
        }
        return res.status(200).json({
            success: true,
            data: companies,
            pagination: {
                total: totalCompanies,
                page,
                limit,
                totalPages: Math.ceil(totalCompanies / limit)
            }
        });

    } catch (err) {
        return next(err)
    }
}

export const handleGetCompanyDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const companyDetails = await getcompanyDetails(id)
        if (!companyDetails) {
            return res.status(401).json({ success: false, message: "no compnay details found" })
        }
        return res.status(200).josn({
            success: true,
            data: companyDetails,
            message: "company details fetch successfully"
        })
    } catch (err) {
        return next(err)
    }
}

export const handleGetJobDetails = async (req, res, next) => {
    try {
        const { id } = req.params
        const jobDetails = await getJobDetails(id)
        if (!jobDetails) {
            return res.status(401).json({ success: false, message: "No job details found" })
        }

        return res.status(200).josn({
            success: true,
            data: jobDetails,
            message: "job details fetch successfully"
        })
    } catch (err) {
        return next(err)
    }
}

export const handleGetRecommendedJobs = async (req, res, next) => {
    try {
        const decoded = req.user;
        if (decoded.role !== "jobseeker") {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        const userId = decoded.userId
        const limit = parseInt(req.query.limit) || 10;
        const recommendedJobs = await getRecommendedJobsService({ userId, limit });
        if (!recommendedJobs) {
            return res.status(401).josn({ success: false, message: "No recommended jobs" })
        }
        return res.status(200).josn({
            success: true,
            data: recommendedJobs,
            message: "recommended job fetch successfully"
        })
    } catch (err) {
        return next(err)
    }
}