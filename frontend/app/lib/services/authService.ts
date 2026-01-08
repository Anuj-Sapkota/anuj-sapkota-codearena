export const authService = {
  getGoogleUrl: () => `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
  getGithubUrl: () => `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,
};