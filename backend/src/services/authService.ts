import { prisma } from "../lib/prisma.js";
import { generateUsername } from "../utils/username.js";
import type { AuthUser, RegisterInput, LoginInput } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ServiceError } from "../errors/ServiceError.js";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../constants/passwordLimit.js";
import { signAccessToken } from "../utils/jwt.js";

//USER REGISTRATION
const register = async ({
  full_name,
  email,
  password,
}: RegisterInput): Promise<AuthUser> => {
  //check required fields
  if (!full_name || !email || !password) {
    throw new ServiceError("Missing required fields", 400);
  }
  //username generation
  const generatedUsername = generateUsername(full_name);

  //check if the user already exists or not
  const userExists = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: generatedUsername }],
    },
  });
  //unique email/user enforcement
  if (userExists) {
    throw new ServiceError("User already exists!", 409);
  }

  //password length rule enforcement
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new ServiceError(
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
      400
    );
  }
  //user creation
  const user = await prisma.user.create({
    data: {
      full_name,
      username: generatedUsername,
      email,
      password_hash: await hashPassword(password),
    },
  });
  //generating access token
  const accessToken = signAccessToken({
    sub: user.userId,
    role: user.role,
  });
  return {
    accessToken,
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      total_points: user.total_points,
    },
  };
};

// USER login
const login = async ({
  emailOrUsername,
  password,
}: LoginInput): Promise<AuthUser> => {
  //checks for email or username matching
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });
  //if user exists
  if (!user) {
    throw new ServiceError("Incorrect Email or Password.", 404);
  }

  const userPassword = user?.password_hash;
  const isPasswordCorrect = await verifyPassword(password, userPassword); //verifying input password and stored password

  if (!isPasswordCorrect) {
    throw new ServiceError("Incorrect Email or Password.", 404);
  }
  //generating access token
  const accessToken = signAccessToken({
    sub: user.userId,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      total_points: user.total_points,
    },
  };
};
export default { register, login };
