import type { AuthUser } from "../types/auth.js";

const formatAuthResponse = (user: any): { user: AuthUser["user"] } => {
  return {
    user: {
      userId: user.userId,
      full_name: user.full_name,
      username: user.username,
      bio: user.bio,
      profile_pic_url: user?.profile_pic_url,
      email: user.email,
      role: user.role,
      has_password: user.has_password,
      total_points: user.total_points,
      google_id: user.google_id,
      github_id: user.github_id,
    },
  };
};

export default formatAuthResponse;