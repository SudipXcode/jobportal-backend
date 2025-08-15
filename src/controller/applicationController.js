import { GetapplicationDetails, createJobApplication, getJobApplication, updateJobApplication, deleteApplication } from '../model/application.model.js'
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const handleCreateApplication = async (re, res, next) => {
    try {
        const data = req.body;
        const decoded = req.user;

        if (decoded.role !== "jobseeker") {
            return res.status(403).json({
                message: "Forbidden: Only jobseeker accounts can create a application",
                success: false,
            });
        }

        const applicationPosted = await createJobApplication(data);

        if (!applicationPosted) {
            return res.status(400).json({ success: false, error: 'failed to job application' });
        }

        return res.status(201).json({
            message: "job application created successfully",
            success: true,
            data: applicationPosted
        });
    } catch (err) {
        return next(err)
    }
}

export const handleGetallApplication = async (req, res, next) => {

    try {
        const decoded = req.user;
        if (decoded.role !== "superadmin") {
            return res.status(403).json({
                message: "Forbidden: Only admin accounts can get a application",
                success: false,
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Search & sort
        const search = req.query.search?.trim() || '';
        const sort = req.query.sort === 'oldest' ? 'asc' : 'desc';


        const getApplication = await getJobApplication({
            limit,
            offset,
            search,
            sort
        });
        if (!getApplication) {
            return res.status(400).json({ success: false, error: 'failed to get job application' });
        }
        return res.status(201).json({
            message: "job application fetch successfully",
            success: true,
            data: getApplication
        });
    } catch (err) {
        return next(err)
    }
}

export const handleGetApplication = async (req, res, next) => {
    try {
        const decoded = req.user;
        const userId = decoded.userId
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Forbidden: Only admin accounts can get a application",
                success: false,
            });
        }

        const getApplication = await getApplication(userId)

        if (!getApplication) {
            return res.status(400).json({ success: false, error: 'failed to get job application' });
        }
        return res.status(201).json({
            message: "job application fetch successfully",
            success: true,
            data: getApplication
        });
    } catch (err) {
        return next(err)
    }
}
export const handleUpdateApplication = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { id } = req.params
        const { status } = req.body
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Forbidden: Only admin accounts can update a application",
                success: false,
            });
        }
        const { jobseekerEmail,
            jobseekerName,
            jobTitle, Jobstatus } = await updateJobApplication({ id, status })

        const worker = new Worker(path.resolve(__dirname, "../worker/jobstatusUpdate.js"));
        worker.postMessage({
            to: jobseekerEmail,
            subject: "Your Job Application Status Has Been Updated",
            text: `Hello ${jobseekerName}, your application status is now: ${Jobstatus}`,
            html: `<p>Hello ${jobseekerName},</p><p>Your application status is now: <b>${jobTitle}</b></p>`
        });

        res.status(200).json({
            message: "Application updated successfully",
            success: true,

        });
    } catch (err) {
        return next(err)
    }
}

export const handleDeleteApplication = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { id } = req.params
        if (decoded.role !== "company" || decoded.role !== "superadmin") {
            return res.status(403).json({
                message: "Forbidden: not authorized",
                success: false,
            });
        }
        const deletedApplication = await deleteApplication(id)
        if (!deletedApplication) {
            return re.status(401).json({ message: "unable to delete", success: false })
        }
        res.status(200).json({
            message: "Application deleted successfully",
            success: true,

        });
    } catch (err) {
        return next(err)
    }
}


export const handleAppliedUserDetails = async (req, res, next) => {
    try {
        const decoded = req.user;
        const { id } = req.params

        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Forbidden: Only admin accounts can get a applicationdetails",
                success: false,
            });
        }
        const applicationDetails = await GetapplicationDetails(id)
        if (!applicationDetails) {
            return re.status(401).json({ message: "unable to fetach application details", success: false })
        }
        res.status(200).json({
            message: "Application details fetch successfully",
            success: true,
            data: applicationDetails

        });
    } catch (err) {
        return next(err)
    }
}