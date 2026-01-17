import Image from "next/image";
import { authService } from "@/lib/services/auth.service";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";

const SocialAuth = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] font-bold text-gray-400 text-center uppercase tracking-widest">
        Sign in with
      </p>

      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => (window.location.href = authService.getGoogleUrl())}
          className="p-3 rounded-full border-2 border-gray-100 hover:border-primary-1/30 hover:bg-gray-50 transition-all duration-200 active:scale-90 cursor-pointer"
        >
          <Image src={GoogleLogoIcon} alt="Google" className="w-6 h-6" />
        </button>

        <button
          onClick={() => (window.location.href = authService.getGithubUrl())}
          className="p-3 rounded-full border-2 border-gray-100 hover:border-primary-1/30 hover:bg-gray-50 transition-all duration-200 active:scale-90 cursor-pointer"
        >
          <Image src={GitHubLogoIcon} alt="GitHub" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SocialAuth;