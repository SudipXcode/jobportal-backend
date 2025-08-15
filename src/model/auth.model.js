// src/model/auth.model.js
import { PrismaClient } from '../../prisma/src/prisma/index.js';
const prisma = new PrismaClient();

export const getUserByEmail = async ({
  email
}) => {
  try {
    const existingUser = await prisma.userData.findUnique({
      where: { email }
    });
    return existingUser
  } catch (err) {
    throw new Error("Failed to get users");
  }
}
export const deleteUseRefreshToken = async ({
  userId
}) => {
  try {

    const success = await prisma.userData.update({
      where: { userId: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
      }
    })
    return success
  } catch (err) {
    throw new Error("Failed to logout user");
  }
}

export const createUser = async ({ password, email, fullName, role }) => {
  try {
    const existingUser = await getUserByEmail({ email })
    if (existingUser) {
      const error = new Error("User already exists");
      error.code = "USER_EXISTS"; // Custom code for controller
      throw error;
    }

    const userData = await prisma.userData.create({
      data: {
        email,
        password,
        fullName,
        role
      }
    });

    return userData;
  } catch (err) {
    if (err.code === 'USER_EXISTS') throw err;

    // Otherwise, wrap other unexpected errors
    const error = new Error("Failed to create user");
    error.original = err;
    throw error;

  }

};

export const deleteUser = async ({ userId }) => {
  try {
    const userDeleted = await prisma.userData.delete({
      where: { userId: userId }
    })
    return userDeleted
  } catch (err) {
    throw new Error("Failed to create user");
  }
}

export const updatePassword = async ({ email, password }) => {
  try {
    const updatedUser = await prisma.userData.update({
      where: { email },
      data: {
        password: password
      }
    })
    return updatedUser
  } catch (err) {
    throw new Error("Failed to update password");
  }
}

export const updateUserRefreshToken = async ({
  userId, refreshToken, refreshTokenExpiryDate
}) => {
  try {
    const updatedUser = await prisma.userData.update({
      where: { userId },
      data: {
        refreshToken,
        refreshTokenExpiry: refreshTokenExpiryDate
      }
    });
    return updatedUser;
  } catch (err) {
    // propagate error to controller and let middleware handle it
    throw new Error("Failed to update refresh token");
  }
};

