"use client";

import { useRouter } from "next/navigation";

import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  //on success redirect to arena page
  const handleSuccess = () => {
    router.push("/explore");
  };

  const handleSwitch = () => {
    router.push("/login");
  };
  
  return <RegisterForm onSuccess={handleSuccess} onSwitch={handleSwitch} />;
};

export default RegisterPage;
