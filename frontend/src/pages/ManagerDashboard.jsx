import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { fetchProgrammeSummary, getProgrammeSummaryData } from "../services/apiMethods";

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

const ManagerDashboard = () => {
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
        setError(err.response?.data?.message || "Failed to fetch manager data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const institutions = summary?.institutions || [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-purple-700">Programme View</p>
        <h1 className="mt-1 text-3xl font-bold">Programme Manager Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Compare attendance performance across all institutions from one place.
        </p>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Institutions" value={summary?.totalInstitutions} />
            <StatCard label="Batches" value={summary?.totalBatches} accent="blue" />
            <StatCard label="Sessions" value={summary?.totalSessions} accent="amber" />
            <StatCard
              label="Attendance Rate"
              value={`${summary?.attendancePercentage ?? 0}%`}
              accent="green"
            />
          </div>

          <section className="bg-white p-5 rounded shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Institution Attendance Summary</h2>
              <span className="rounded bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                {institutions.length} institutions
              </span>
            </div>
            {institutions.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Institution</th>
                      <th className="px-4 py-3 font-semibold">Batches</th>
                      <th className="px-4 py-3 font-semibold">Students</th>
                      <th className="px-4 py-3 font-semibold">Sessions</th>
                      <th className="px-4 py-3 font-semibold">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map((institution) => (
                      <tr key={institution.institutionId} className="border-t">
                        <td className="px-4 py-3">
                          <p className="font-medium">{institution.institutionName}</p>
                          <p className="text-sm text-gray-500">{institution.institutionEmail}</p>
                        </td>
                        <td className="px-4 py-3">{institution.totalBatches}</td>
                        <td className="px-4 py-3">{institution.totalStudents}</td>
                        <td className="px-4 py-3">{institution.totalSessions}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 rounded bg-gray-200">
                              <div
                                className="h-2 rounded bg-green-500"
                                style={{
                                  width: `${Math.min(institution.attendancePercentage || 0, 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold">
                              {institution.attendancePercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No institution summaries are available yet.</p>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
