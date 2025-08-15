import bcrypt from 'bcrypt';
import { generateRefreshToken, generateAccessToken } from '../util/token.util.js';

import {
  createadmin,
  updateAdminRefreshToken,
  getAdminByEmail,
  deleteAdminRefreshToken,
  updateAdminPassword,
  suspendUser,
  adminDeleteUser,
  createIndustry,
  createskills,
  getAllReport,
  GetallJobseeker,
  GetallCompany,
  getCompanyDetails,
  getJobseekerDetails,
  deleteJobs,
  getJobDetails,
  GetallJobs,
  getdashboardData,
  deleteskills,
  deleteindustry
} from '../model/admin.model.js';
export const handleCreateAdminaccount = async (req, res, next) => {
  try {
    const { password, email, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await createadmin({ password: hashedPassword, email, role });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'failed to register' });
    }

    const accessToken = generateAccessToken(admin.adminId, admin.email, admin.role);
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const refreshToken = generateRefreshToken(admin.userId, admin.email, admin.role, refreshExpiry);

    await updateAdminRefreshToken({
      adminId: admin.adminId,
      refreshToken,
      refreshTokenExpiryDate: refreshExpiry,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(201).json({
      message: 'admin registered successfully',
      success: true,
    });
  } catch (err) {
    if (err.code === 'admin_EXISTS') {
      return res.status(409).json({ success: false, error: 'admin already exist' });
    }
    if (err.code === 'superadmin_EXISTS') {
      return res.status(409).json({ success: false, error: 'super admin already exist' });
    }
    return next(err);
  }
}

export const handleLoginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await getAdminByEmail({ email })
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const accessToken = generateAccessToken(admin.adminId, admin.email, admin.role);
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const refreshToken = generateRefreshToken(admin.userId, admin.email, admin.role, refreshExpiry);

    await updateAdminRefreshToken({
      adminId: admin.adminId,
      refreshToken,
      refreshTokenExpiryDate: refreshExpiry,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: 'Admin logged in successfully' });
  } catch (err) {
    return next(err);
  }
}


export const handleLogoutAdmin = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;

    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    const success = await deleteAdminRefreshToken({ adminId });
    if (!success) {
      return res.status(400).json({ error: "unable to logout" })
    }
    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(200).json({ success: true, message: 'Admin logout in successfully' });
  } catch (err) {
    return next(err);
  }
}

export const handleAdminForgetpassword = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const admin = await getAdminByEmail({ email });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'user not found' })
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await updateAdminPassword({ email, password: hashedPassword })
    if (!result) {
      return res.status(401).json({ success: false, error: 'Fail to forget password' })
    }
    return res.status(200).json({ success: true, message: "admin password updated successfully", data: { email: result.email } })

  } catch (err) {
    return next(err);
  }
}

export const handleChangeAdminPassword = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    const email = decoded.email
    const { password } = req.body
    console.log(email, password)
    if (!adminId) {
      return res.status(500).json({ success: false, error: 'Invalid token' });
    }
    const admin = await getAdminByEmail({ email });

    if (!admin) {
      return res.status(401).json({ success: false, error: 'admin not found' })
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await updateAdminPassword({ email, password: hashedPassword })
    if (!result) {
      return res.status(401).json({ success: false, error: 'Fail to change password' })
    }
    return res.status(200).json({ success: true, message: "admin password updated successfully", data: { email: result.email } })
  } catch (err) {
    return next(err);
  }
}

export const handleDeleteUserAccount = async (req, res, next) => {
  try {
    const { email } = req.body;
    const decoded = req.user
    const adminId = decoded.userId
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }

    if (decoded.role !== "superadmin") {
      return res.status(500).json({ success: false, error: 'Not authorized' });
    }
    const userDeleted = await adminDeleteUser({ email })
    if (!userDeleted) {
      return res.status(400).json({ error: "failed to delete user" })
    }

    return res.status(200).json({ success: true, message: "admin deleted user successfully" })
  } catch (err) {
    return next(err);
  }
}
export const handleSuspendUseraccount = async (req, res, next) => {
  try {
    const { email } = req.body;
    const decoded = req.user
    const adminId = decoded.userId
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }
    if (decoded.role !== "superadmin") {
      return res.status(500).json({ success: false, error: 'Not authorized' });
    }
    const userSuspended = await suspendUser({ email })
    if (!userSuspended) {
      return res.status(400).json({ error: "failed to suspend user" })
    }

    return res.status(200).json({ success: true, message: "admin suspend user successfully" })
  } catch (err) {
    return next(err);
  }
}


export const handleCreateindustry = async (req, res, next) => {
  try {
    const { industries } = req.body
    const decoded = req.user
    const adminId = decoded.userId
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }
    if (decoded.role !== "superadmin") {
      return res.status(500).json({ success: false, error: 'Not authorized' });
    }

    const industriesUpload = await createIndustry(industries)
    if (!industriesUpload) {
      return res.status(400).json({ error: "failed to upload industries" })
    }
    return res.status(201).json({ success: true, message: "admin upload industry successfully" })

  } catch (err) {
    return next(err);
  }
}
export const handleCreateskills = async (req, res, next) => {
  try {
    const { skills } = req.body
    const decoded = req.user
    const adminId = decoded.userId
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }
    if (decoded.role !== "superadmin") {
      return res.status(500).json({ success: false, error: 'Not authorized' });
    }
    const skillsUpload = await createskills(skills)
    if (!skillsUpload) {
      return res.status(400).json({ error: "failed to upload skills" })
    }
    return res.status(201).json({ success: true, message: "admin upload skills successfully" })

  } catch (err) {
    return next(err);
  }
}

export const handleDeleteSkills = async (req, res, next) => {
  try {
    const decoded = req.user
    const adminId = decoded.userId

    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }
    if (decoded.role !== "superadmin") {
      return res.status(500).json({ success: false, error: 'Not authorized' });
    }
    const { id } = req.params;
    const deleteSkills = await deleteskills(id)
    if (!deleteSkills) {
      return res.status(400).json({ error: "failed to delete skills" })
    }
    return res.status(200).json({ success: true, message: "admin deleted skill successfully" })

  } catch (err) {
    return next(err);
  }
}
export const handleDeleteIndustry = async (req, res, next) => {
  try {
    const decoded = req.user
    const adminId = decoded.userId
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }
    if (decoded.role !== "superadmin") {
      return res.status(500).json({ success: false, error: 'Not authorized' });
    }
    const { id } = req.params;
    const deleteIndustry = await deleteindustry(id)

    if (!deleteIndustry) {
      return res.status(400).json({ error: "failed to delete industry" })
    }
    return res.status(200).json({ success: true, message: "admin deleted industry successfully" })

  } catch (err) {
    return next(err);
  }
}

export const handleGetUserReport = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;

    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Pagination params (defaults: page 1, limit 20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Assuming you modify this function to accept pagination & sorting
    const { reports, totalCount } = await getAllReport({ limit, offset });

    return res.status(200).json({
      success: true,
      message: "Admin fetched user reports successfully",
      data: {
        reports,
        pagination: {
          page,
          limit,
          totalReports: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        }
      }
    });

  } catch (err) {
    return next(err);
  }
};

export const handleGetallJobseeker = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const jobseekerPage = parseInt(req.query.jobseekerPage) || 1;
    const limit = 20;
    const jobseekerOffset = (jobseekerPage - 1) * limit;
    const search = req.query.search || ''; // name search
    const sort = req.query.sort === 'oldest' ? 'asc' : 'desc'; // default: recent (desc)

    const { jobseekers, jobseekerCount } = await GetallJobseeker({
      limit,
      offset: jobseekerOffset,
      search,
      sort
    })

    return res.status(201).json({
      success: true, message: "admin fetch all jobseeker", data: {
        jobseekers,
        pagination: {
          page: jobseekerPage,
          limit,
          totalUsers: jobseekerCount,
          totalPages: Math.ceil(jobseekerCount / limit),

        }
      }
    })
  } catch (err) {
    return next(err);
  }
}


export const handleGetallCompanies = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const companiesPage = parseInt(req.query.companiesPage) || 1;
    const limit = 20;
    const companiesOffset = (companiesPage - 1) * limit;
    const search = req.query.search || ''; // name search
    const sort = req.query.sort === 'oldest' ? 'asc' : 'desc'; // default: recent (desc)
    const subscribed = req.query.subscribed;
    const { companies, companiesCount } = await GetallCompany({
      limit,
      offset: companiesOffset,
      search,
      sort,
      subscribed
    })

    return res.status(201).json({
      success: true, message: "admin get all company", data: {
        companies,
        pagination: {
          page: companiesPage,
          limit,
          totalUsers: companiesCount,
          totalPages: Math.ceil(companiesCount / limit),

        }
      }
    })
  } catch (err) {
    return next(err);
  }
}

export const handleGetCompany = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const companyId = req.params.id
    const companyDetails = await getCompanyDetails({ companyId })
    if (!companyDetails) {
      return res.status(400).json({ success: false, message: "company detail not found" })
    }
    return res.status(200).json({ success: true, message: "company detail fetched successfully", data: companyDetails })

  } catch (err) {
    return next(err);
  }
}
export const handleGetJobseeker = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const jobseekerId = req.params.id;
    const jobseekerDetails = await getJobseekerDetails({ jobseekerId });

    if (!jobseekerDetails) {
      // Jobseeker not found
      return res.status(404).json({ success: false, message: "Jobseeker not found" });
    }

    return res.status(200).json({ success: true, message: "Admin fetched jobseeker successfully", data: jobseekerDetails });

  } catch (err) {
    return next(err);
  }
};



export const handleDeleteJob = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    const { jobId } = req.body
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const jobDeleted = await deleteJobs({ jobId })
    if (!jobDeleted) {
      return res.status(400).json({ error: "failed to no job delete jobs" })
    }
    return res.status(200).json({ success: true, message: "admin deleteed job successfully" })

  } catch (err) {
    return next(err);
  }
}

export const handleGetJobs = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const jobsPage = parseInt(req.query.jobsPage) || 1;
    const limit = 20;
    const jobsOffset = (jobsPage - 1) * limit;
    const search = req.query.search || ''; // name search
    const sort = req.query.sort === 'oldest' ? 'asc' : 'desc';
    const premiumType = req.query.premiumType;
    const { jobs, jobsCount } = await GetallJobs({
      limit,
      offset: jobsOffset,
      search,
      sort,
      premiumType
    })

    return res.status(201).json({
      success: true, message: "admin get all jobs", data: {
        jobs,
        pagination: {
          page: jobsPage,
          limit,
          totaljobs: jobsCount,
          totalPages: Math.ceil(jobsCount / limit),

        }
      }
    })
  } catch (err) {
    return next(err);
  }
}

export const handleJobDetails = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const jobId = req.params.id
    const jobDetails = await getJobDetails({ jobId })
    if (!jobDetails) {
      return res.status(400).json({ success: false, message: "no job to fetch job details" })
    }
    return res.status(200).json({ success: true, message: "admin get job details", data: jobDetails })

  } catch (err) {
    return next(err);
  }
}

export const handleDashboard = async (req, res, next) => {
  try {
    const decoded = req.user;
    const adminId = decoded.userId;
    if (!adminId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    //total jobs, toal company, toal revenue, total applications
    const { totalJobs, totalCompanies, totalRevenue, totalApplication, totalJobseekers } = await getdashboardData()

    return res.status(200).json({
      success: true, message: "admin job all dhasboard adata", data: {
        totalJobs, totalCompanies, totalRevenue, totalApplication, totalJobseekers
      }
    })

  } catch (err) {
    return next(err);
  }
}