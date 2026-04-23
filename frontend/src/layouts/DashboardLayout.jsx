import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);

export default DashboardLayout;
