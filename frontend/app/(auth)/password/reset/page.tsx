"use client";
import { useRouter } from "next/navigation";
const ForgotPasswordPage = () => {
  const router = useRouter();

const handleReset = (e: React.FormEvent<HTMLFormElement>): void =>
{
  e.preventDefault();
  router.push("/password/done")
}

//when cancel is clicked
const handleCancel = ():void =>
{
  router.back();
}
  return (
    <>
         {/* Container */}
      <div className="bg-gray-300 w-full flex flex-col gap-4 py-6 px-4 rounded-md shadow-[20px] shadow-gray-100">
        <h1 className="border-b-2 border-gray-300 pb-4 text-2xl font-semibold">Forgot your password?</h1>

        <p className="text-gray-600">Enter your email and we’ll send you a link to reset it.</p>
        {/* Form */}
        <form onSubmit={handleReset} className="flex flex-col gap-4 px-4 w-full">
          {/* Email Field */}
          <input
            type="text"
            name="email"
            autoComplete="email"
            placeholder="Email"
            className="w-full max-w-md border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />

         <div className="flex flex-col justify-center items-center gap-4">
           {/* Button */}
          <button type="submit" className="w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white">Send Reset Link</button>
          <button onClick={handleCancel} className="cursor-pointer hover:text-blue-800">Cancel</button>
         </div>
        </form>
       
      </div>
    </>
   
  )
}

export default ForgotPasswordPage