import {prisma} from "../lib/prisma.js";
import type { User } from "../../generated/prisma/index.js";
import type { CreateUserDTO } from "../types/user.types.js";
import { generateUsername } from "../utils/username.js";
import type { AuthUser, RegisterInput } from "../types/auth.js";
import { hashPassword } from "../utils/password.js";

const registerUser = async ({full_name, email, password}: RegisterInput): Promise<AuthUser> => {

 const user = await prisma.user.create({
    data: {
      full_name,
      username: generateUsername(full_name),
      email,
      password_hash: await hashPassword(password),
    },
  });

  return {
    userId: user.userId,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role,
    total_points: user.total_points
  };
};

export default { registerUser };
