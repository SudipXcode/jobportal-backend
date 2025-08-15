import express from "express";
const router = express.Router()

import { validateReq, validateIdParam } from '../middleware/reqValidate.middleware.js'
import { validateAccessToken } from '../middleware/validateToken.middleware.js'
import { handleCreateCompanyProfile, handleGetCompanyProfile, handleUpdateCompanyProfile } from '../controller/company.controller.js'
import { companyProfileSchema } from '../schema/company.schema.js'
import { upload } from '../middleware/validateBinary.middleware.js'

router.post("/companyProfile", upload.single("photo"), validateReq(companyProfileSchema), validateAccessToken(), handleCreateCompanyProfile)
router.get("/companyProfile", validateAccessToken(), handleGetCompanyProfile)
router.patch("/updateCompanyProfile/:id",upload.single("photo"), validateIdParam(), validateReq(companyProfileSchema), validateAccessToken(), handleUpdateCompanyProfile)


export default router;