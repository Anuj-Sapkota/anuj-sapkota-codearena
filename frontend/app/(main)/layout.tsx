"use client"; // Important since ProtectedRoute is a client component

import React from "react";
import Navbar from "../../components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const MainPagesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MainPagesLayout;