import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import AuthRouter from './router/auth.router.js' 
import AdminRouter from './router/admin.router.js'
import JobsRouter from './router/jobs.router.js'
import ApplicationRouter from './router/application.router.js'
import PaymentRouter from './router/payment.router.js'
import CompanyRouter from './router/company.router.js'
import JobseekerRouter from './router/jobseeker.router.js'
import {globalErrorHandler} from './middleware/errorHandling.middleware.js'
import { reactivateSuspendedUsersJob } from './cornSchedule/reactivateSuspendedUser.js'

dotenv.config()

const app = express()
app.disable("x-powered-by")

const PORT = process.env.PORT || 5001

// Relaxed Helmet config for development
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:3000"],
      styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:3000"],
      imgSrc: ["'self'", "data:", "http://localhost:3000"],
      connectSrc: ["'self'", "ws://localhost:3000", "http://localhost:3000"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "no-referrer-when-downgrade" },
  frameguard: { action: "sameorigin" },
  hsts: false, // Disable HSTS in dev (no HTTPS locally)
  noSniff: true,
  xssFilter: true,
}))

// Middleware
app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))
reactivateSuspendedUsersJob()
//routes
app.use("/api/auth", AuthRouter)
app.use("/api/jobseeker", JobseekerRouter)
app.use("/api/company", CompanyRouter)
app.use("/api/admin",AdminRouter)
app.use("/api/jobs",JobsRouter)
app.use("/api/application",ApplicationRouter),
app.use("/api/payment",PaymentRouter)
//error handling 
app.use(globalErrorHandler)
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

