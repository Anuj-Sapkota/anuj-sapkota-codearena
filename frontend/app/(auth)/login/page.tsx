"use client";
import { useRouter } from "next/navigation";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage:React.FC = () => {
 const router = useRouter()
  //on success redirect to arena page
  const handleSuccess = () => {
    router.push("/explore")
  }

  const handleSwitch = () => {
router.push("/register")
  } 
  return (
   <LoginForm  onSuccess={handleSuccess} onSwitch={handleSwitch}/>
  );
};

export default LoginPage;
