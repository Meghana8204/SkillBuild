import React from "react";

/* ── helpers (unchanged logic) ── */
const getSessionId = (session) => session._id || session.id || session.sessionId;
const getSessionKey = (session, index) => {
  const sessionId = getSessionId(session);
  return sessionId ? `${sessionId}-${index}` : `session-row-${index}`;
};
const formatDate = (value) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const normalizeStatus = (status) => {
  if (!status || status === "not_marked") return "Not marked";
  return status.charAt(0).toUpperCase() + status.slice(1);
};
const isMarkedPresent  = (status) => status?.toLowerCase() === "present";
const isMarkedAbsent   = (status) => status?.toLowerCase() === "absent";

/* ── icons ── */
const CheckIcon = () => (
  <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = () => (
  <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const XIcon = () => (
  <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CalendarIcon = () => (
  <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ── status badge ── */
const StatusBadge = ({ status }) => {
  if (isMarkedPresent(status))
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em",
        background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#16a34a",
      }}>
        <CheckIcon /> Present
      </span>
    );
  if (isMarkedAbsent(status))
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em",
        background: "#fff5f5", border: "1.5px solid #fecaca", color: "#dc2626",
      }}>
        <XIcon /> Absent
      </span>
    );
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em",
      background: "#f5f3ff", border: "1.5px solid #ddd6fe", color: "#7c3aed",
    }}>
      <ClockIcon /> {normalizeStatus(status)}
    </span>
  );
};

/* ── main component ── */
const AttendanceTable = ({ sessions = [], onMarkAttendance, userRole }) => {
  const isStudent = userRole === "student";

  /* summary counts */
  const present = sessions.filter((s) => isMarkedPresent(s.attendanceStatus)).length;
  const total   = sessions.length;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      {/* ── summary strip ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20,
      }}>
        {[
          { label: "Total Sessions", value: total,           bg: "#f5f3ff", border: "#ddd6fe", color: "#7c3aed" },
          { label: "Present",        value: present,         bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
          { label: "Absent",         value: total - present, bg: "#fff5f5", border: "#fecaca", color: "#dc2626" },
          { label: "Attendance",     value: `${pct}%`,       bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
        ].map(({ label, value, bg, border, color }) => (
          <div key={label} style={{
            flex: "1 1 100px", minWidth: 100,
            background: bg, border: `1.5px solid ${border}`, borderRadius: 12,
            padding: "10px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "#6b7280", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── table card ── */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid #ede9fe",
        boxShadow: "0 4px 24px rgba(109,40,217,0.07)",
        overflow: "hidden",
      }}>

        {/* header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1.5px solid #ede9fe",
          background: "linear-gradient(135deg,#faf5ff,#f5f3ff)",
        }}>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#3b0764" }}>
              Attendance Record
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 2, fontWeight: 400 }}>
              {total} session{total !== 1 ? "s" : ""} total
            </div>
          </div>
          {/* Progress pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#fff", border: "1.5px solid #ddd6fe",
            borderRadius: 24, padding: "6px 14px",
          }}>
            <div style={{
              width: 60, height: 6, background: "#ede9fe", borderRadius: 99, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: "linear-gradient(90deg,#7c3aed,#a855f7)",
                borderRadius: 99, transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed" }}>{pct}%</span>
          </div>
        </div>

        {/* table */}
        {sessions.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
            No sessions found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["#", "Session", "Date", "Status", ...(isStudent ? ["Action"] : [])].map((h) => (
                    <th key={h} style={{
                      padding: "11px 20px", textAlign: "left",
                      fontSize: "0.7rem", fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "#9ca3af", borderBottom: "1.5px solid #ede9fe",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, idx) => {
                  const present = isMarkedPresent(session.attendanceStatus);
                  const sid     = getSessionId(session);
                  return (
                    <tr key={getSessionKey(session, idx)} style={{
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#faf5ff"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* index */}
                      <td style={{ padding: "14px 20px", width: 48 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 26, height: 26, borderRadius: 8,
                          background: "#f5f3ff", border: "1.5px solid #ddd6fe",
                          fontSize: "0.72rem", fontWeight: 600, color: "#7c3aed",
                        }}>{idx + 1}</span>
                      </td>

                      {/* session name */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          fontSize: "0.875rem", fontWeight: 500, color: "#1f2937",
                          display: "block", maxWidth: 220,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {session.name || session.title || "Untitled session"}
                        </span>
                      </td>

                      {/* date */}
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: "0.8rem", fontWeight: 400, color: "#6b7280",
                        }}>
                          <CalendarIcon />
                          {formatDate(session.date)}
                        </span>
                      </td>

                      {/* status */}
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge status={session.attendanceStatus} />
                      </td>

                      {/* action (student only) */}
                      {isStudent && (
                        <td style={{ padding: "14px 20px" }}>
                          {present ? (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              fontSize: "0.78rem", fontWeight: 600, color: "#16a34a",
                            }}>
                              <CheckIcon /> Marked
                            </span>
                          ) : (
                            <button
                              onClick={() => onMarkAttendance(sid)}
                              disabled={!sid}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "0.78rem", fontWeight: 600,
                                color: sid ? "#fff" : "#9ca3af",
                                background: sid
                                  ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                                  : "#f3f4f6",
                                border: `1.5px solid ${sid ? "transparent" : "#e5e7eb"}`,
                                borderRadius: 10,
                                padding: "7px 14px",
                                cursor: sid ? "pointer" : "not-allowed",
                                boxShadow: sid ? "0 2px 8px rgba(124,58,237,0.25)" : "none",
                                transition: "opacity 0.18s, transform 0.15s",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) => { if (sid) e.currentTarget.style.opacity = "0.88"; }}
                              onMouseLeave={(e) => { if (sid) e.currentTarget.style.opacity = "1"; }}
                            >
                              Mark Attendance
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;