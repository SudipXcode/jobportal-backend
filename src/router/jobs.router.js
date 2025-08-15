import express from "express";
const router = express.Router()
import { validateAccessToken } from '../middleware/validateToken.middleware.js'
import { validateReq, validateIdParam } from "../middleware/reqValidate.middleware.js";
import { jobSchema } from '../schema/jobSchema.js'
import {
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleGetAllJobs,
    handleGetJobDetails,
    handleGetRecommendedJobs,
    handleGetAllCompanies,
    handleGetCompanyDetails
} from '../controller/job.controller.js'

router.post("/postjob", validateReq(jobSchema), validateAccessToken(), handleCreateJob)
router.patch("/updatejob/:id", validateIdParam(), validateReq(jobSchema), validateAccessToken(), handleUpdateJob)
router.delete("/deletejob/:id", validateIdParam(), validateAccessToken(), handleDeleteJob)

router.get("/allJobs", handleGetAllJobs)
router.get("/companies", handleGetAllCompanies)
router.get('/company/:id', validateIdParam(), handleGetCompanyDetails)

router.get("/jobDetails/:id", validateIdParam(), handleGetJobDetails)
router.get("/recommendedJobs", validateAccessToken(), handleGetRecommendedJobs)//ai + send jobs notification to email


export default router; 