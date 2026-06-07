"use client";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { UserProfile } from "@/types/auth.types";

const LoginPage: React.FC = () => {
  const router = useRouter();
  //on success redirect to arena page
  const handleSuccess = (user: UserProfile) => {
    if (user.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/explore");
    }
  };

  const handleSwitch = () => {
    router.push("/register");
  };
  return <LoginForm onSuccess={handleSuccess} onSwitch={handleSwitch} />;
};

export default LoginPage;
