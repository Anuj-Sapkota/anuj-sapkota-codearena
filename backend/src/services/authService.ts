import {prisma} from "../lib/prisma.js";
import type { User } from "../../generated/prisma/index.js";
import type { CreateUserDTO } from "../types/user.types.js";
import { generateUsername } from "../utils/username.js";

const createUser = async (data: CreateUserDTO): Promise<User> => {
  return prisma.user.create({
    data: {
      full_name: data.full_name,
      username: generateUsername(data.full_name),
      email: data.email,
      password_hash: data.password,
    },
  });
};

export default { createUser };
