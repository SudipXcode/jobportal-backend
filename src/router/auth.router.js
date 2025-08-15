import express from "express";
const router = express.Router()
import {
    handleGetRefreshToken,
    handleCreateUser,
    handlegetOtp,
    handleverifyOtp,
    handleLogin,
    handleforgetPasssword,
    handleLogout,
    handleDeleteUser,
    handleChangePassword
} from '../controller/auth.controller.js'
import { validateReq } from '../middleware/reqValidate.middleware.js'
import { registerSchema, otpSchema, verifyEmailSchema, loginSchema, forgetPasswordSchema, changePasswordSchema } from '../schema/auth.schema.js'
import { validateAccessToken, validateRefreshToken } from '../middleware/validateToken.middleware.js'

router.post("/register", validateReq(registerSchema), handleCreateUser)
router.post("/login", validateReq(loginSchema), handleLogin)
router.post("/logout", validateAccessToken(), handleLogout)
router.patch("/changePassword", validateReq(changePasswordSchema), validateAccessToken(), handleChangePassword)
router.patch('/forgetpassword', validateReq(forgetPasswordSchema), handleforgetPasssword)
router.post("/getOtp", validateReq(otpSchema), handlegetOtp)
router.post("/verifyEmail", validateReq(verifyEmailSchema), handleverifyOtp)
router.delete("/userDeleted", validateAccessToken(), handleDeleteUser)
router.post("/refreshtoken", validateRefreshToken(), handleGetRefreshToken)

export default router;