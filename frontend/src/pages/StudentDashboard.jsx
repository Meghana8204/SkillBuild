import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AttendanceTable from "../components/AttendanceTable";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { fetchSessions, markAttendance } from "../services/apiMethods";
import { useAuth } from "../context/useAuth";
import { notifySuccess, notifyError } from "../utils/toast";

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const loadSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSessions();
      setSessions(data.sessions || data); // adapt to backend shape
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
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
              ? {
                  ...session,
                  attendanceStatus: attendance.status,
                  markedAt: attendance.markedAt
                }
              : session
          )
        );
      }

      notifySuccess("Attendance marked!");
      loadSessions();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : (
        <AttendanceTable
          sessions={sessions}
          onMarkAttendance={handleMarkAttendance}
          userRole={user?.role}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
