import express from "express";
import {
    adminRegisterSchema,
    adminLoginSchema,
    forgetpasswordSchema,
    changePasswordSchema,
    suspendUserSchema,
    industriesSchema,
    skillsSchema,
    deleteJobSchema
} from '../schema/admin.schema.js'
import {
    handleCreateAdminaccount,
    handleLoginAdmin,
    handleLogoutAdmin,
    handleAdminForgetpassword,
    handleChangeAdminPassword,
    handleDeleteUserAccount,
    handleSuspendUseraccount,
    handleGetUserReport,
    handleCreateskills,
    handleCreateindustry,
    handleDeleteJob,
    handleGetJobs,
    handleDashboard,
    handleGetallJobseeker,
    handleGetallCompanies,
    handleGetCompany,
    handleGetJobseeker,
    handleJobDetails,
    handleDeleteSkills,
    handleDeleteIndustry
} from "../controller/admin.controller.js";
import { validateAccessToken } from '../middleware/validateToken.middleware.js'
import { validateReq, validateIdParam } from "../middleware/reqValidate.middleware.js";
const router = express.Router()

router.post('/adminAccount', validateReq(adminRegisterSchema), handleCreateAdminaccount)
router.post("/loginAdmin", validateReq(adminLoginSchema), handleLoginAdmin)
router.post("/logoutAdmin", validateAccessToken(), handleLogoutAdmin)
router.patch("/forgetPassword", validateReq(forgetpasswordSchema), handleAdminForgetpassword)
router.patch("/changePassword", validateReq(changePasswordSchema), validateAccessToken(), handleChangeAdminPassword)
router.delete("/deleteUserAccount", validateReq(suspendUserSchema), validateAccessToken(), handleDeleteUserAccount)
router.patch("/suspendUserAccount", validateReq(suspendUserSchema), validateAccessToken(), handleSuspendUseraccount)

router.post("/industry", validateReq(industriesSchema), validateAccessToken(), handleCreateindustry)
router.post("/skills", validateReq(skillsSchema), validateAccessToken(), handleCreateskills)
router.delete("/skills/:id", validateIdParam(), validateAccessToken(), handleDeleteSkills)
router.delete("/industry/:id", validateIdParam(), validateAccessToken(), handleDeleteIndustry)

router.get("/userReports", validateAccessToken(), handleGetUserReport)
router.get("/allJobseeker", validateAccessToken(), handleGetallJobseeker)
router.get("/allCompany", validateAccessToken(), handleGetallCompanies)
router.get("/jobseeker/:id", validateIdParam(), validateAccessToken(), handleGetJobseeker)
router.get("/company/:id", validateIdParam(), validateAccessToken(), handleGetCompany)
router.delete("/deleteJob", validateReq(deleteJobSchema), validateAccessToken(), handleDeleteJob)
router.get("/allJobs", validateAccessToken(), handleGetJobs)
router.get("/job/:id", validateIdParam(), validateAccessToken(), handleJobDetails)

router.get("/dashboard", validateAccessToken(), handleDashboard)

export default router;