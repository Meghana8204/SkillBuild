import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { createBatch, fetchInstitutionSummary } from "../services/apiMethods";
import { useAuth } from "../context/useAuth";
import API from "../services/api";
import { notifyError, notifySuccess } from "../utils/toast";

const getSummary = (summaryResponse) =>
  summaryResponse?.data?.summary || summaryResponse?.summary || {};

/* ─── Style block ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .inst-root * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }

  /* Page header */
  .inst-page-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #7c3aed; margin-bottom: 4px;
  }
  .inst-page-title {
    font-size: 28px; font-weight: 700; color: #111827;
    letter-spacing: -0.4px; margin: 0 0 4px;
  }
  .inst-page-sub {
    font-size: 13.5px; color: #6b7280; margin: 0 0 28px; font-weight: 400;
  }

  /* Stat cards */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (min-width: 900px) { .stat-grid { grid-template-columns: repeat(4, 1fr); } }

  .stat-card {
    background: white;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    border-top: 3px solid transparent;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .stat-card.purple { border-top-color: #7c3aed; }
  .stat-card.blue   { border-top-color: #2563eb; }
  .stat-card.amber  { border-top-color: #d97706; }
  .stat-card.green  { border-top-color: #16a34a; }

  .stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .stat-icon.purple { background: #f5f3ff; color: #7c3aed; }
  .stat-icon.blue   { background: #eff6ff; color: #2563eb; }
  .stat-icon.amber  { background: #fffbeb; color: #d97706; }
  .stat-icon.green  { background: #f0fdf4; color: #16a34a; }

  .stat-label {
    font-size: 12px; font-weight: 500; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
  }
  .stat-value { font-size: 30px; font-weight: 700; color: #111827; line-height: 1; }

  /* Section cards */
  .section-card {
    background: white;
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    margin-bottom: 24px;
  }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px; margin-bottom: 20px;
  }

  .section-title {
    font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 2px;
  }
  .section-sub {
    font-size: 12.5px; color: #9ca3af; margin: 0;
  }

  .count-badge {
    font-size: 12px; font-weight: 600;
    border-radius: 20px; padding: 4px 12px;
  }
  .count-badge.purple { background: #f5f3ff; color: #6d28d9; }
  .count-badge.blue   { background: #eff6ff; color: #1d4ed8; }
  .count-badge.green  { background: #f0fdf4; color: #15803d; }

  /* Create batch form */
  .batch-form {
    display: grid; gap: 12px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 700px) { .batch-form { grid-template-columns: 1fr 1fr auto; } }

  .form-input, .form-select {
    padding: 11px 14px; border: 2px solid #e5e7eb; border-radius: 10px;
    font-size: 14px; font-family: 'Poppins', sans-serif; font-weight: 400;
    color: #111827; background: #f9fafb; outline: none;
    transition: all 0.2s ease; width: 100%;
  }
  .form-select { appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
  }
  .form-input:focus, .form-select:focus {
    border-color: #7c3aed; background: #faf5ff;
    box-shadow: 0 0 0 4px rgba(124,58,237,0.08);
  }

  .create-btn {
    padding: 11px 20px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: white; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(109,40,217,0.3);
    transition: all 0.2s ease;
    display: flex; align-items: center; gap: 7px;
  }
  .create-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(109,40,217,0.4); }
  .create-btn:active { transform: translateY(0); }

  /* Tables */
  .inst-table { width: 100%; border-collapse: collapse; }
  .inst-table thead tr { background: #f9fafb; }
  .inst-table th {
    padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: #9ca3af; text-align: left;
  }
  .inst-table td { padding: 13px 16px; font-size: 14px; color: #374151; }
  .inst-table tbody tr { border-top: 1px solid #f3f4f6; transition: background 0.15s; }
  .inst-table tbody tr:hover { background: #fafafa; }

  .batch-name-cell { font-weight: 600; color: #111827; }
  .batch-id-cell { font-size: 12px; color: #9ca3af; font-family: monospace; }

  /* Trainer cards */
  .trainer-grid {
    display: grid; gap: 12px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) { .trainer-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1100px) { .trainer-grid { grid-template-columns: repeat(3, 1fr); } }

  .trainer-card {
    border: 1.5px solid #f3f4f6; border-radius: 12px; padding: 16px;
    display: flex; align-items: center; gap: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .trainer-card:hover { border-color: #c4b5fd; box-shadow: 0 2px 12px rgba(124,58,237,0.08); }

  .trainer-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px; font-weight: 700; flex-shrink: 0;
  }

  .trainer-name { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px; }
  .trainer-email { font-size: 12px; color: #9ca3af; }

  /* Progress bar */
  .progress-wrap { display: flex; align-items: center; gap: 10px; }
  .progress-track {
    height: 6px; width: 100px; border-radius: 99px; background: #e5e7eb; flex-shrink: 0;
  }
  .progress-fill { height: 6px; border-radius: 99px; background: linear-gradient(90deg, #16a34a, #4ade80); }

  .pct-badge {
    font-size: 12px; font-weight: 700;
    padding: 2px 8px; border-radius: 20px;
    background: #f0fdf4; color: #15803d;
  }
  .pct-badge.low { background: #fef2f2; color: #b91c1c; }
  .pct-badge.mid { background: #fffbeb; color: #92400e; }

  /* Empty state */
  .empty-state {
    border: 2px dashed #e5e7eb; border-radius: 12px;
    padding: 40px; text-align: center; color: #9ca3af;
    font-size: 14px; font-weight: 500;
  }
  .empty-state-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: #f9fafb; display: flex; align-items: center;
    justify-content: center; margin: 0 auto 12px; color: #d1d5db;
  }

  /* Attendance summary header badge */
  .att-badge {
    font-size: 13px; font-weight: 700;
    padding: 6px 14px; border-radius: 20px;
    background: #f0fdf4; color: #15803d;
    border: 1px solid #bbf7d0;
  }
`;

/* ─── Sub-components ────────────────────────────────────────────── */

const StatCard = ({ label, value, accent = "purple", icon }) => (
  <div className={`stat-card ${accent}`}>
    <div className={`stat-icon ${accent}`}>{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? 0}</div>
  </div>
);

const EmptyState = ({ message, icon }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    {message}
  </div>
);

const BatchesPanel = ({ batches }) => (
  <div className="section-card">
    <div className="section-header">
      <div>
        <h2 className="section-title">Batches</h2>
        <p className="section-sub">All batches under your institution</p>
      </div>
      <span className="count-badge purple">{batches.length} total</span>
    </div>
    {batches.length ? (
      <div style={{ overflowX: "auto" }}>
        <table className="inst-table">
          <thead>
            <tr>
              <th>Batch Name</th>
              <th>Batch ID</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch._id || batch.id}>
                <td className="batch-name-cell">{batch.name}</td>
                <td className="batch-id-cell">{batch._id || batch.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState
        message="No batches found. Create your first batch above."
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        }
      />
    )}
  </div>
);

const TrainersPanel = ({ trainers }) => (
  <div className="section-card">
    <div className="section-header">
      <div>
        <h2 className="section-title">Trainers</h2>
        <p className="section-sub">Trainers affiliated with your institution</p>
      </div>
      <span className="count-badge blue">{trainers.length} total</span>
    </div>
    {trainers.length ? (
      <div className="trainer-grid">
        {trainers.map((trainer) => (
          <div key={trainer._id || trainer.id} className="trainer-card">
            <div className="trainer-avatar">
              {(trainer.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <div className="trainer-name">{trainer.name || "Unnamed trainer"}</div>
              <div className="trainer-email">{trainer.email}</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        message="No trainers found."
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        }
      />
    )}
  </div>
);

const PctBadge = ({ pct }) => {
  const cls = pct >= 75 ? "" : pct >= 50 ? "mid" : "low";
  return <span className={`pct-badge ${cls}`}>{pct}%</span>;
};

const AttendanceSummaryPanel = ({ summary }) => {
  const batches = summary.batches || [];
  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Attendance Summary</h2>
          <p className="section-sub">{summary.institutionName || "Institution"} performance overview</p>
        </div>
        <span className="att-badge">{summary.attendancePercentage ?? 0}% overall</span>
      </div>
      {batches.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="inst-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Students</th>
                <th>Sessions</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const pct = batch.attendancePercentage || 0;
                return (
                  <tr key={batch.batchId}>
                    <td style={{ fontWeight: 600 }}>{batch.batchName}</td>
                    <td>{batch.totalStudents}</td>
                    <td>{batch.totalSessions}</td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <PctBadge pct={pct} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          message="No attendance data available yet."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          }
        />
      )}
    </div>
  );
};

/* ─── Main dashboard ────────────────────────────────────────────── */
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
      setBatchForm((f) => ({
        ...f,
        trainerId: f.trainerId || nextTrainers[0]?._id || "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch institution data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user?.id, user?.institutionId]);

  const handleBatchFormChange = (e) =>
    setBatchForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await createBatch({
        name: batchForm.name.trim(),
        trainerId: batchForm.trainerId || undefined,
      });
      notifySuccess("Batch created successfully");
      setBatchForm({ name: "", trainerId: trainers[0]?._id || "" });
      loadData();
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to create batch");
    }
  };

  const viewTitles = {
    dashboard: "Institution Dashboard",
    batches: "Batches",
    trainers: "Trainers",
  };

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div className="inst-root">
        {/* Page header */}
        <p className="inst-page-label">SkillBridge</p>
        <h1 className="inst-page-title">{viewTitles[view] || "Institution Dashboard"}</h1>
        <p className="inst-page-sub">
          Manage institution activity, assigned trainers, batches, and attendance health.
        </p>

        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            {/* Stat cards — dashboard only */}
            {view === "dashboard" && (
              <div className="stat-grid">
                <StatCard
                  label="Total Batches"
                  value={summaryData.totalBatches ?? batches.length}
                  accent="purple"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </svg>
                  }
                />
                <StatCard
                  label="Total Trainers"
                  value={trainers.length}
                  accent="blue"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  }
                />
                <StatCard
                  label="Total Students"
                  value={summaryData.totalStudents}
                  accent="amber"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  }
                />
                <StatCard
                  label="Attendance"
                  value={`${summaryData.attendancePercentage ?? 0}%`}
                  accent="green"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  }
                />
              </div>
            )}

            {/* Create batch form */}
            {(view === "dashboard" || view === "batches") && (
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Create Batch</h2>
                    <p className="section-sub">Set up a new batch and optionally assign a trainer.</p>
                  </div>
                </div>
                <form onSubmit={handleCreateBatch} className="batch-form">
                  <input
                    type="text"
                    name="name"
                    value={batchForm.name}
                    onChange={handleBatchFormChange}
                    placeholder="Batch name"
                    className="form-input"
                    required
                  />
                  <select
                    name="trainerId"
                    value={batchForm.trainerId}
                    onChange={handleBatchFormChange}
                    className="form-select"
                  >
                    <option value="">No trainer assigned</option>
                    {trainers.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="create-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create Batch
                  </button>
                </form>
              </div>
            )}

            {/* Batches panel */}
            {(view === "dashboard" || view === "batches") && (
              <BatchesPanel batches={batches} />
            )}

            {/* Trainers panel */}
            {(view === "dashboard" || view === "trainers") && (
              <TrainersPanel trainers={trainers} />
            )}

            {/* Attendance summary */}
            {view === "dashboard" && (
              <AttendanceSummaryPanel summary={summaryData} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstitutionDashboard;