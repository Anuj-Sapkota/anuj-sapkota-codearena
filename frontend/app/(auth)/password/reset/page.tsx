import React from 'react'

const page = () => {
  return (
   <>
   {/* Container */}
      <div className="bg-gray-300 w-full flex flex-col gap-4 py-4 px-2 rounded-md shadow-[20px] shadow-gray-100">
    <h1 className="border-b border-gray-400 pb-4 text-2xl font-semibold px-4">Change Password</h1>

        {/* Form */}
        <form className="flex flex-col gap-4 px-4 w-full">
          {/* Email Password Fields */}
          <input
            type="password"
            name="password"
            placeholder="New Password"
            className="w-full max-w-md border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />

          <input
            type="password"
            name="confirmNewPassword"
            placeholder="Enter Password Again"
            className="w-full max-w-lg border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />

    

          {/* Reset button */}
          <button className="w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white">Change Password</button>
         
          
        </form>
      
      </div>
   </>
  )
}

export default page