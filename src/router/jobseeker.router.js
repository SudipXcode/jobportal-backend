import express from "express";
const router = express.Router()
import { validateReq, validateIdParam } from '../middleware/reqValidate.middleware.js'
import { validateAccessToken } from '../middleware/validateToken.middleware.js'
import { handleCreateReportIssue, handleDeleteJobPreferences, handleJobPreferences, handleUpdateResume, handlecreateJobseekerSkills, handleCreateJobseekerProfile, handleGetJobseekerprofile, handleUpdateJobseekerProfile, handleCreateJobseekerDetails, handleUpdateJobseekerEducation } from '../controller/jobseeker.controller.js'
import { jobseekerProfileSchema, jobseekerDetailsSchema, reportIssueSchema, jobpreferencesSchema, jobseekerSkillsSchema, jobseekerEducationSchema } from '../schema/jobseeker.schema.js'
import { upload } from '../middleware/validateBinary.middleware.js'

router.post('/jobseekerProfile', upload.single("photo"), validateReq(jobseekerProfileSchema), validateAccessToken(), handleCreateJobseekerProfile)
router.get("/jobseekerProfile", validateAccessToken(), handleGetJobseekerprofile)

router.patch("/updateJobseekerProfile/:id", upload.single("photo"), validateIdParam(), validateReq(jobseekerProfileSchema), validateAccessToken(), handleUpdateJobseekerProfile)

router.post('/jobseekerDetils', upload.single("resume"), validateReq(jobseekerDetailsSchema), validateAccessToken(), handleCreateJobseekerDetails)
router.patch("/updateJobseekerEducation/:id", validateIdParam(), validateReq(jobseekerEducationSchema), validateAccessToken(), handleUpdateJobseekerEducation)
router.post("/createjobseekerSkills", validateReq(jobseekerSkillsSchema), validateAccessToken(), handlecreateJobseekerSkills)
router.put("/resume/:id", upload.single("resume"), validateIdParam(), validateAccessToken(), handleUpdateResume)

router.post("/jobPreference", validateReq(jobpreferencesSchema), validateAccessToken(), handleJobPreferences)
router.delete("/deleteJobPreference/:id", validateIdParam(), validateAccessToken(), handleDeleteJobPreferences)

router.post("/reportIssue", validateReq(reportIssueSchema), validateAccessToken(), handleCreateReportIssue)



export default router; 