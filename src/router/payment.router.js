import express from "express";
const router = express.Router()
import { validateAccessToken } from '../middleware/validateToken.middleware.js'
import { validateReq } from "../middleware/reqValidate.middleware.js";
import { paymentSchema } from '../schema/payment.schema.js'
import { handlePayment, handleGetPaymentDetails, handleGetPaymentHistory } from '../controller/payment.controller.js'
router.post("/payment", validateReq(paymentSchema), validateAccessToken(), handlePayment)
router.get('/paymentDetails/:id', validateAccessToken(), handleGetPaymentDetails)
router.get("/paymenthistory", validateAccessToken(), handleGetPaymentHistory)
export default router;