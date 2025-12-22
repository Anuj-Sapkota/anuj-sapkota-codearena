import {prisma} from "../lib/prisma.js";
import type { User } from "../../generated/prisma/index.js";
import type { CreateUserDTO } from "../types/user.types.js";
import { generateUsername } from "../utils/username.js";
import type { AuthUser, RegisterInput } from "../types/auth.js";
import { hashPassword } from "../utils/password.js";
import { ServiceError } from "../errors/ServiceError.js";

const registerUser = async ({full_name, email, password}: RegisterInput): Promise<AuthUser> => {

  //check required fields
  if (!full_name || !email || !password) {
  throw new ServiceError("Missing required fields", 400);
}
  //username generation
  const generatedUsername = generateUsername(full_name);

  //check if the user already exists or not
  const userExists = await prisma.user.findFirst(
    {
      where: {
        OR: [
          {email},
          {username: generatedUsername}
        ]
      }
    }
  )

  if (userExists)
  {
    throw new ServiceError("User already exists!", 409);
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
