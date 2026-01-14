"use client";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
 
  return (
    <div className="bg-gray-500 h-screen relative inset-0 flex justify-center items-center">
      <div className="w-full max-w-md px-6">{children}</div>
    </div>
  );
}
