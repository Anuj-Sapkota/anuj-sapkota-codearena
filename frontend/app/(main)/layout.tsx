import React from "react";
import Navbar from "../components/layout/Navbar";

const MainPagesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default MainPagesLayout;
