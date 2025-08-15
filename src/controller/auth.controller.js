// src/controller/auth.controller.js
import bcrypt from 'bcrypt';
import { generateRefreshToken, generateAccessToken } from '../util/token.util.js';
import { updateUserRefreshToken, createUser, getUserByEmail, updatePassword, deleteUseRefreshToken, deleteUser } from '../model/auth.model.js';
import { sendOtp, verifyOtp } from '../util/email.util.js';

export const handleCreateUser = async (req, res, next) => {
  try {
    const { password, email, fullName, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ password: hashedPassword, email, fullName, role });
    if (!user) {
      return res.status(401).json({ success: false, error: 'failed to register' });
    }

    const accessToken = generateAccessToken(user.userId, user.email, user.role);
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const refreshToken = generateRefreshToken(user.userId, user.email, user.role, refreshExpiry);

    await updateUserRefreshToken({
      userId: user.userId,
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
      message: 'User registered successfully',
      success: true,
    });
  } catch (err) {
    if (err.code === 'USER_EXISTS') {
      return res.status(409).json({ success: false, error: 'User already exist' });
    }
    return next(err);
  }
};

export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.userId, user.email, user.role);
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const refreshToken = generateRefreshToken(user.userId, user.email, user.role, refreshExpiry);

    await updateUserRefreshToken({
      userId: user.userId,
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

    return res.status(200).json({ success: true, message: 'User logged in successfully' });
  } catch (err) {
    return next(err);
  }
};

export const handleDeleteUser = async (req, res, next) => {
  try {
    const decoded = req.user;
    const userId = decoded.userId
    if (!userId) {
      return res.status(400).json({ error: "Invalid token payload" })
    }
    const userDeleted = await deleteUser({ userId })
    if (!userDeleted) {
      return res.status(400).json({ error: "failed to delete user" })
    }
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

    return res.status(200).json({
      success: true,
      message: "user deleted successful",
    });

  } catch (err) {
    return next(err);
  }
}

export const handleLogout = async (req, res, next) => {
  try {
    const decoded = req.user;
    const userId = decoded.userId;

    if (!userId) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    // Delete refresh token from DB
    const success = await deleteUseRefreshToken({ userId });
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

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (err) {
    return next(err);
  }
};

export const handleforgetPasssword = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await getUserByEmail({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'user not found' })
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await updatePassword({ email, password: hashedPassword })
    if (!result) {
      return res.status(401).json({ success: false, error: 'Fail to forget password' })
    }
    return res.status(200).json({ success: true, message: "user password updated successfully", data: { email: result.email } })
  } catch (err) {
    return next(err)
  }
}

export const handleChangePassword = async (req, res, next) => {
  try {
    const decoded = req.user;
    const userId = decoded.userId;
    const email = decoded.email
    const { password } = req.body
    console.log(email, password)
    if (!userId) {
      return res.status(500).json({ success: false, error: 'Invalid token' });
    }
    const user = await getUserByEmail({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: 'user not found' })
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await updatePassword({ email, password: hashedPassword })
    if (!result) {
      return res.status(401).json({ success: false, error: 'Fail to forget password' })
    }
    return res.status(200).json({ success: true, message: "user password updated successfully", data: { email: result.email } })
  } catch (err) {
    return next(err);
  }
}

export const handlegetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const send = await sendOtp(email);
    if (!send) {
      return res.status(500).json({ success: false, error: 'Unable to send OTP' });
    }
    return res.status(200).json({
      message: `OTP is sent to ${email}`,
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};

export const handleverifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const verified = verifyOtp({ email, inputOtp: otp });

    if (!verified) {
      return res.status(400).json({ success: false, error: 'OTP is invalid or expired.' });
    }

    return res.status(200).json({
      message: 'OTP is verified',
      success: true,
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return next(err);
  }
};

export const handleGetRefreshToken = async (req, res, next) => {
  try {
    const decoded = req.user;
    const userId = decoded.userId;
    const email = decoded.email
    if (!userId) {
      return res.status(500).json({ success: false, error: 'Invalid token' });
    }
    const user = await getUserByEmail({ email });
    if (!user || !user.refreshToken) {
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
      return res.status(403).json({ success: false, error: "User not found or refresh token missing" });
    }
    const accessToken = generateAccessToken(user.userId, user.email, user.role);
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const refreshToken = generateRefreshToken(user.userId, user.email, user.role, refreshExpiry);

    await updateUserRefreshToken({
      userId: user.userId,
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
      message: 'User token refresh successfully',
      success: true,
    });

  } catch (err) {
    console.error('Error refreshing token:', err);
    return next(err);
  }
}