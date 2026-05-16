import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AttendanceTable from "../components/AttendanceTable";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { fetchSessions, markAttendance } from "../services/apiMethods";
import { useAuth } from "../context/useAuth";
import { notifySuccess, notifyError } from "../utils/toast";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .std-root * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }

  /* Page header */
  .std-page-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #7c3aed; margin-bottom: 4px;
  }
  .std-page-title {
    font-size: 28px; font-weight: 700; color: #111827;
    letter-spacing: -0.4px; margin: 0 0 4px;
  }
  .std-page-sub {
    font-size: 13.5px; color: #6b7280; margin: 0 0 28px; font-weight: 400;
  }

  /* Welcome banner */
  .std-banner {
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #a855f7 100%);
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
  }

  .std-banner::before {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    top: -60px; right: 40px;
  }
  .std-banner::after {
    content: '';
    position: absolute;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    bottom: -30px; right: 160px;
  }

  .std-banner-left { position: relative; z-index: 1; }

  .std-banner-greeting {
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.75); margin-bottom: 4px;
  }
  .std-banner-name {
    font-size: 22px; font-weight: 700; color: white; letter-spacing: -0.3px;
  }
  .std-banner-hint {
    font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px;
  }

  .std-banner-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0; position: relative; z-index: 1;
    backdrop-filter: blur(6px);
  }

  /* Section card */
  .std-section-card {
    background: white; border-radius: 14px; padding: 24px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  }

  .std-section-header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px; margin-bottom: 20px;
  }
  .std-section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 2px; }
  .std-section-sub   { font-size: 12.5px; color: #9ca3af; margin: 0; }

  .std-count-badge {
    font-size: 12px; font-weight: 600; border-radius: 20px;
    padding: 4px 12px; background: #f5f3ff; color: #6d28d9;
  }

  /* Refresh button */
  .std-refresh-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px; border: 2px solid #ede9fe;
    background: white; color: #7c3aed;
    font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s ease;
  }
  .std-refresh-btn:hover { background: #faf5ff; border-color: #c4b5fd; }

  @keyframes spin-slow { to { transform: rotate(360deg); } }
  .std-refresh-btn.spinning svg { animation: spin-slow 0.7s linear infinite; }
`;

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const loadSessions = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const data = await fetchSessions();
      setSessions(data.sessions || data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAttendance = async (sessionId) => {
    try {
      const data = await markAttendance(sessionId);
      const attendance = data.data?.attendance;
      if (attendance) {
        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            (session._id || session.id || session.sessionId) === sessionId
              ? { ...session, attendanceStatus: attendance.status, markedAt: attendance.markedAt }
              : session
          )
        );
      }
      notifySuccess("Attendance marked!");
      loadSessions(true);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const firstName = user?.name?.split(" ")[0] || "Student";

  // Derive quick stats from sessions
  const totalSessions = sessions.length;
  const markedSessions = sessions.filter(
    (s) => s.attendanceStatus === "present" || s.attendanceStatus === "marked"
  ).length;
  const pendingSessions = sessions.filter(
    (s) => !s.attendanceStatus || s.attendanceStatus === "pending"
  ).length;

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div className="std-root">

        {/* Page label + title */}
        <p className="std-page-label">SkillBridge</p>
        <h1 className="std-page-title">Student Dashboard</h1>
        <p className="std-page-sub">
          Track your sessions and mark your attendance on time.
        </p>

        {/* Welcome banner */}
        <div className="std-banner">
          <div className="std-banner-left">
            <p className="std-banner-greeting">Welcome back,</p>
            <p className="std-banner-name">{firstName} 👋</p>
            <p className="std-banner-hint">
              {pendingSessions > 0
                ? `You have ${pendingSessions} session${pendingSessions > 1 ? "s" : ""} awaiting attendance.`
                : totalSessions > 0
                ? "You're all caught up — great work!"
                : "No sessions assigned yet."}
            </p>
          </div>
          <div className="std-banner-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error} />
        ) : (
          <div className="std-section-card">
            <div className="std-section-header">
              <div>
                <h2 className="std-section-title">Your Sessions</h2>
                <p className="std-section-sub">
                  {markedSessions} of {totalSessions} sessions attended
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="std-count-badge">{totalSessions} total</span>
                <button
                  className={`std-refresh-btn${refreshing ? " spinning" : ""}`}
                  onClick={() => loadSessions(true)}
                  disabled={refreshing}
                  title="Refresh sessions"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            <AttendanceTable
              sessions={sessions}
              onMarkAttendance={handleMarkAttendance}
              userRole={user?.role}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;