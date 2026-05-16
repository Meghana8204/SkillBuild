import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .dash-layout * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }

  .dash-layout {
    min-height: 100vh;
    display: flex;
    background: #f3f0ff;
  }

  /* Sidebar slot */
  .dash-sidebar {
    flex-shrink: 0;
    /* Sidebar component controls its own width */
  }

  /* Main content area */
  .dash-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* prevent flex overflow */
  }

  /* Navbar slot */
  .dash-navbar {
    flex-shrink: 0;
  }

  /* Page content */
  .dash-main {
    flex: 1;
    padding: 28px 32px;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .dash-main { padding: 20px 16px; }
  }

  @media (max-width: 480px) {
    .dash-main { padding: 16px 12px; }
  }
`;

const DashboardLayout = ({ children }) => (
  <>
    <style>{styles}</style>
    <div className="dash-layout">
      <div className="dash-sidebar">
        <Sidebar />
      </div>
      <div className="dash-body">
        <div className="dash-navbar">
          <Navbar />
        </div>
        <main className="dash-main">
          {children}
        </main>
      </div>
    </div>
  </>
);

export default DashboardLayout;