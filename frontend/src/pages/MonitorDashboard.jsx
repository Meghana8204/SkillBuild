import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { fetchProgrammeSummary, getProgrammeSummaryData } from "../services/apiMethods";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .mgr-root * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }

  .mgr-page-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #7c3aed; margin-bottom: 4px;
  }
  .mgr-page-title {
    font-size: 28px; font-weight: 700; color: #111827;
    letter-spacing: -0.4px; margin: 0 0 4px;
  }
  .mgr-page-sub {
    font-size: 13.5px; color: #6b7280; margin: 0 0 28px; font-weight: 400;
  }

  /* Stat grid */
  .mgr-stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (min-width: 900px) { .mgr-stat-grid { grid-template-columns: repeat(4, 1fr); } }

  .mgr-stat-card {
    background: white; border-radius: 14px; padding: 20px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    border-top: 3px solid transparent;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .mgr-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .mgr-stat-card.purple { border-top-color: #7c3aed; }
  .mgr-stat-card.blue   { border-top-color: #2563eb; }
  .mgr-stat-card.amber  { border-top-color: #d97706; }
  .mgr-stat-card.green  { border-top-color: #16a34a; }

  .mgr-stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .mgr-stat-icon.purple { background: #f5f3ff; color: #7c3aed; }
  .mgr-stat-icon.blue   { background: #eff6ff; color: #2563eb; }
  .mgr-stat-icon.amber  { background: #fffbeb; color: #d97706; }
  .mgr-stat-icon.green  { background: #f0fdf4; color: #16a34a; }

  .mgr-stat-label {
    font-size: 12px; font-weight: 500; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
  }
  .mgr-stat-value { font-size: 30px; font-weight: 700; color: #111827; line-height: 1; }

  /* Section card */
  .mgr-section-card {
    background: white; border-radius: 14px; padding: 24px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  }

  .mgr-section-header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px; margin-bottom: 20px;
  }
  .mgr-section-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 2px; }
  .mgr-section-sub   { font-size: 12.5px; color: #9ca3af; margin: 0; }

  .mgr-count-badge {
    font-size: 12px; font-weight: 600; border-radius: 20px;
    padding: 4px 12px; background: #f5f3ff; color: #6d28d9;
  }

  /* Table */
  .mgr-table { width: 100%; border-collapse: collapse; }
  .mgr-table thead tr { background: #f9fafb; }
  .mgr-table th {
    padding: 10px 16px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    color: #9ca3af; text-align: left;
  }
  .mgr-table td { padding: 14px 16px; font-size: 14px; color: #374151; }
  .mgr-table tbody tr { border-top: 1px solid #f3f4f6; transition: background 0.15s; }
  .mgr-table tbody tr:hover { background: #fafafa; }

  /* Institution cell */
  .inst-name  { font-weight: 600; color: #111827; margin-bottom: 2px; }
  .inst-email { font-size: 12px; color: #9ca3af; }

  /* Institution avatar */
  .inst-cell { display: flex; align-items: center; gap: 12px; }
  .inst-avatar {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 700;
  }

  /* Numeric cells */
  .mgr-num {
    font-size: 14px; font-weight: 600; color: #111827;
  }

  /* Progress */
  .mgr-progress-wrap { display: flex; align-items: center; gap: 10px; }
  .mgr-progress-track {
    height: 6px; width: 90px; border-radius: 99px; background: #e5e7eb; flex-shrink: 0;
  }
  .mgr-progress-fill { height: 6px; border-radius: 99px; }

  .mgr-pct-badge {
    font-size: 12px; font-weight: 700;
    padding: 2px 8px; border-radius: 20px;
    background: #f0fdf4; color: #15803d;
    white-space: nowrap;
  }
  .mgr-pct-badge.low { background: #fef2f2; color: #b91c1c; }
  .mgr-pct-badge.mid { background: #fffbeb; color: #92400e; }

  /* Empty */
  .mgr-empty {
    border: 2px dashed #e5e7eb; border-radius: 12px;
    padding: 40px; text-align: center; color: #9ca3af; font-size: 14px; font-weight: 500;
  }
  .mgr-empty-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: #f9fafb; display: flex; align-items: center;
    justify-content: center; margin: 0 auto 12px; color: #d1d5db;
  }

  /* Rank badge */
  .rank-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 6px; font-size: 11px;
    font-weight: 700; flex-shrink: 0;
  }
  .rank-1 { background: #fef9c3; color: #854d0e; }
  .rank-2 { background: #f1f5f9; color: #475569; }
  .rank-3 { background: #fff7ed; color: #9a3412; }
  .rank-n { background: #f9fafb; color: #9ca3af; }
`;

const StatCard = ({ label, value, accent = "purple", icon }) => (
  <div className={`mgr-stat-card ${accent}`}>
    <div className={`mgr-stat-icon ${accent}`}>{icon}</div>
    <div className="mgr-stat-label">{label}</div>
    <div className="mgr-stat-value">{value ?? 0}</div>
  </div>
);

const PctBadge = ({ pct }) => {
  const cls = pct >= 75 ? "" : pct >= 50 ? "mid" : "low";
  const fillColor = pct >= 75 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  return { cls, fillColor };
};

const RankBadge = ({ index }) => {
  const cls = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "rank-n";
  return (
    <span className={`rank-badge ${cls}`}>
      {index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}
    </span>
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

  // Sort by attendance descending for ranking
  const ranked = [...institutions].sort(
    (a, b) => (b.attendancePercentage || 0) - (a.attendancePercentage || 0)
  );

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div className="mgr-root">
        <p className="mgr-page-label">Programme View</p>
        <h1 className="mgr-page-title">Programme Manager Dashboard</h1>
        <p className="mgr-page-sub">
          Compare attendance performance across all institutions from one place.
        </p>

        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error} />
        ) : (
          <>
            {/* Stat cards */}
            <div className="mgr-stat-grid">
              <StatCard
                label="Institutions"
                value={summary?.totalInstitutions}
                accent="purple"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="9" width="18" height="12" rx="1"/>
                    <path d="M8 9V7a4 4 0 0 1 8 0v2"/>
                  </svg>
                }
              />
              <StatCard
                label="Batches"
                value={summary?.totalBatches}
                accent="blue"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                }
              />
              <StatCard
                label="Sessions"
                value={summary?.totalSessions}
                accent="amber"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                }
              />
              <StatCard
                label="Attendance Rate"
                value={`${summary?.attendancePercentage ?? 0}%`}
                accent="green"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                }
              />
            </div>

            {/* Institution table */}
            <div className="mgr-section-card">
              <div className="mgr-section-header">
                <div>
                  <h2 className="mgr-section-title">Institution Attendance Summary</h2>
                  <p className="mgr-section-sub">Ranked by attendance rate, highest first</p>
                </div>
                <span className="mgr-count-badge">{institutions.length} institutions</span>
              </div>

              {ranked.length ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="mgr-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Institution</th>
                        <th>Batches</th>
                        <th>Students</th>
                        <th>Sessions</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((inst, idx) => {
                        const pct = inst.attendancePercentage || 0;
                        const { cls, fillColor } = PctBadge({ pct });
                        return (
                          <tr key={inst.institutionId}>
                            <td><RankBadge index={idx} /></td>
                            <td>
                              <div className="inst-cell">
                                <div className="inst-avatar">
                                  {(inst.institutionName || "?")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="inst-name">{inst.institutionName}</div>
                                  <div className="inst-email">{inst.institutionEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="mgr-num">{inst.totalBatches}</span></td>
                            <td><span className="mgr-num">{inst.totalStudents}</span></td>
                            <td><span className="mgr-num">{inst.totalSessions}</span></td>
                            <td>
                              <div className="mgr-progress-wrap">
                                <div className="mgr-progress-track">
                                  <div
                                    className="mgr-progress-fill"
                                    style={{
                                      width: `${Math.min(pct, 100)}%`,
                                      background: fillColor,
                                    }}
                                  />
                                </div>
                                <span className={`mgr-pct-badge ${cls}`}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mgr-empty">
                  <div className="mgr-empty-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="9" width="18" height="12" rx="1"/>
                      <path d="M8 9V7a4 4 0 0 1 8 0v2"/>
                    </svg>
                  </div>
                  No institution summaries are available yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;