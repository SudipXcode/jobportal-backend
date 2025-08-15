import express from "express";
import { validateAccessToken } from '../middleware/validateToken.middleware.js'
import {
    handleCreateApplication,
    handleGetallApplication,
    handleGetApplication,
    handleUpdateApplication,
    handleDeleteApplication,
    handleAppliedUserDetails
} from '../controller/applicationController.js'
import { validateReq, validateIdParam } from "../middleware/reqValidate.middleware.js";
import { applicationSchema, applicationUpdateSchema } from '../schema/application.schema.js'
const router = express.Router()

router.post('/jobApplication', validateReq(applicationSchema), validateAccessToken(), handleCreateApplication)// user post job application
router.get('/getAllJobApplication', validateAccessToken(), handleGetallApplication)// admin get all application with jobs

router.get("/getJobApplication", validateAccessToken(), handleGetApplication)//company get application based on job id
router.patch("/jobApplication/:id", validateIdParam(), validateReq(applicationUpdateSchema), validateAccessToken(), handleUpdateApplication) // company update application status
router.delete("/jobApplication", validateAccessToken(), handleDeleteApplication) // jobseker or company delete
router.get("/appliedUserDetails/:id", validateIdParam(), validateAccessToken(), handleAppliedUserDetails)//applied user detals by compnay


export default router;