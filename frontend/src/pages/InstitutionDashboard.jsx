import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { createBatch, fetchInstitutionSummary } from "../services/apiMethods";
import { useAuth } from "../context/useAuth";
import API from "../services/api";
import { notifyError, notifySuccess } from "../utils/toast";

const getSummary = (summaryResponse) => summaryResponse?.data?.summary || summaryResponse?.summary || {};

const StatCard = ({ label, value, accent = "purple" }) => {
  const accentClasses = {
    purple: "border-purple-500 bg-purple-50 text-purple-700",
    green: "border-green-500 bg-green-50 text-green-700",
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    amber: "border-amber-500 bg-amber-50 text-amber-700"
  };

  return (
    <div className={`rounded border-l-4 p-4 shadow-sm ${accentClasses[accent]}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
    {message}
  </div>
);

const BatchesPanel = ({ batches }) => (
  <section className="bg-white p-5 rounded shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Batches</h2>
      <span className="rounded bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
        {batches.length} total
      </span>
    </div>
    {batches.length ? (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Batch Name</th>
              <th className="px-4 py-3 font-semibold">Batch ID</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch._id || batch.id} className="border-t">
                <td className="px-4 py-3 font-medium">{batch.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{batch._id || batch.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState message="No batches found." />
    )}
  </section>
);

const TrainersPanel = ({ trainers }) => (
  <section className="bg-white p-5 rounded shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Trainers</h2>
      <span className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
        {trainers.length} total
      </span>
    </div>
    {trainers.length ? (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {trainers.map((trainer) => (
          <div key={trainer._id || trainer.id} className="rounded border border-gray-200 p-4">
            <p className="font-semibold">{trainer.name || "Unnamed trainer"}</p>
            <p className="mt-1 text-sm text-gray-500">{trainer.email}</p>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState message="No trainers found." />
    )}
  </section>
);

const AttendanceSummaryPanel = ({ summary }) => {
  const batches = summary.batches || [];

  return (
    <section className="bg-white p-5 rounded shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Attendance Summary</h2>
          <p className="text-sm text-gray-500">{summary.institutionName || "Institution"} performance overview</p>
        </div>
        <span className="rounded bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
          {summary.attendancePercentage ?? 0}% attendance
        </span>
      </div>
      {batches.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Students</th>
                <th className="px-4 py-3 font-semibold">Sessions</th>
                <th className="px-4 py-3 font-semibold">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.batchId} className="border-t">
                  <td className="px-4 py-3 font-medium">{batch.batchName}</td>
                  <td className="px-4 py-3">{batch.totalStudents}</td>
                  <td className="px-4 py-3">{batch.totalSessions}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 rounded bg-gray-200">
                        <div
                          className="h-2 rounded bg-green-500"
                          style={{ width: `${Math.min(batch.attendancePercentage || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{batch.attendancePercentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No attendance summary available yet." />
      )}
    </section>
  );
};

const InstitutionDashboard = ({ view = "dashboard" }) => {
  const [batches, setBatches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batchForm, setBatchForm] = useState({ name: "", trainerId: "" });
  const { user } = useAuth();
  const summaryData = getSummary(summary);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [batchesRes, trainersRes, summaryRes] = await Promise.all([
        API.get("/batches"),
        API.get("/batches/trainers"),
        fetchInstitutionSummary(user?.institutionId || user?.id || "me"),
      ]);
      const nextTrainers = trainersRes.data.trainers || [];

      setBatches(batchesRes.data.batches || []);
      setTrainers(nextTrainers);
      setSummary(summaryRes);
      setBatchForm((currentForm) => ({
        ...currentForm,
        trainerId: currentForm.trainerId || nextTrainers[0]?._id || ""
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch institution data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, user?.institutionId]);

  const handleBatchFormChange = (e) => {
    setBatchForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    try {
      await createBatch({
        name: batchForm.name.trim(),
        trainerId: batchForm.trainerId || undefined
      });
      notifySuccess("Batch created successfully");
      setBatchForm({
        name: "",
        trainerId: trainers[0]?._id || ""
      });
      loadData();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to create batch");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-purple-700">SkillBridge</p>
        <h1 className="mt-1 text-3xl font-bold">
          {view === "batches" ? "Batches" : view === "trainers" ? "Trainers" : "Institution Dashboard"}
        </h1>
        <p className="mt-2 text-gray-500">
          Manage institution activity, assigned trainers, batches, and attendance health.
        </p>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <Error message={error} />
      ) : (
        <div className="space-y-6">
          {(view === "dashboard" || view === "batches") && (
            <section className="bg-white p-5 rounded shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Create Batch</h2>
                <p className="text-sm text-gray-500">
                  Create a batch for your institution and optionally assign a trainer.
                </p>
              </div>
              <form onSubmit={handleCreateBatch} className="grid gap-4 md:grid-cols-3">
                <input
                  type="text"
                  name="name"
                  value={batchForm.name}
                  onChange={handleBatchFormChange}
                  placeholder="Batch name"
                  className="border p-2 rounded"
                  required
                />
                <select
                  name="trainerId"
                  value={batchForm.trainerId}
                  onChange={handleBatchFormChange}
                  className="border p-2 rounded"
                >
                  <option value="">Create without assigning trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer._id || trainer.id} value={trainer._id || trainer.id}>
                      {trainer.name} ({trainer.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Create Batch
                </button>
              </form>
            </section>
          )}
          {view === "dashboard" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Batches" value={summaryData.totalBatches ?? batches.length} />
              <StatCard label="Total Trainers" value={trainers.length} accent="blue" />
              <StatCard label="Total Students" value={summaryData.totalStudents} accent="amber" />
              <StatCard label="Attendance" value={`${summaryData.attendancePercentage ?? 0}%`} accent="green" />
            </div>
          )}
          {(view === "dashboard" || view === "batches") && (
            <BatchesPanel batches={batches} />
          )}
          {(view === "dashboard" || view === "trainers") && (
            <TrainersPanel trainers={trainers} />
          )}
          {view === "dashboard" && (
            <AttendanceSummaryPanel summary={summaryData} />
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstitutionDashboard;
