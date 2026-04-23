import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { fetchProgrammeSummary, getProgrammeSummaryData } from "../services/apiMethods";

const statusLabels = {
  present: "Present",
  absent: "Absent",
  late: "Late"
};

const StatCard = ({ label, value, accent = "purple" }) => {
  const accentClasses = {
    purple: "border-purple-500 bg-purple-50 text-purple-700",
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    green: "border-green-500 bg-green-50 text-green-700",
    amber: "border-amber-500 bg-amber-50 text-amber-700"
  };

  return (
    <div className={`rounded border-l-4 p-4 shadow-sm ${accentClasses[accent]}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
};

const MonitorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const summaryRes = await fetchProgrammeSummary();
        setSummary(getProgrammeSummaryData(summaryRes));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch summary");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const statusCounts = summary?.statusCounts || {};

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-purple-700">Read-Only View</p>
        <h1 className="mt-1 text-3xl font-bold">Monitoring Officer Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Programme-wide attendance rates with no create, edit, or delete actions.
        </p>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Attendance Rate" value={`${summary?.attendancePercentage ?? 0}%`} accent="green" />
            <StatCard label="Institutions" value={summary?.totalInstitutions} />
            <StatCard label="Batches" value={summary?.totalBatches} accent="blue" />
            <StatCard label="Sessions" value={summary?.totalSessions} accent="amber" />
          </div>

          <section className="bg-white p-5 rounded shadow-sm">
            <h2 className="text-lg font-semibold">Attendance Breakdown</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {Object.entries(statusLabels).map(([status, label]) => (
                <div key={status} className="rounded border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{statusCounts[status] ?? 0}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-5 rounded shadow-sm">
            <h2 className="text-lg font-semibold">Programme Snapshot</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="mt-2 text-2xl font-bold">{summary?.totalStudents ?? 0}</p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Trainers</p>
                <p className="mt-2 text-2xl font-bold">{summary?.totalTrainers ?? 0}</p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Attendance Records</p>
                <p className="mt-2 text-2xl font-bold">{summary?.totalAttendanceRecords ?? 0}</p>
              </div>
              <div className="rounded border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Institutions Reporting</p>
                <p className="mt-2 text-2xl font-bold">{summary?.institutions?.length ?? 0}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MonitorDashboard;
