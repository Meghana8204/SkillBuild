import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../utils/routes";
import { clearPendingInvite, getInvitePath, getPendingInvite } from "../utils/invite";

const roles = [
  "student",
  "trainer",
  "institution",
  "programme_manager",
  "monitoring_officer",
];

const roleLabels = {
  student: "Student",
  trainer: "Trainer",
  institution: "Institution",
  programme_manager: "Programme Manager",
  monitoring_officer: "Monitoring Officer",
};

const roleIcons = {
  student: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  trainer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  institution: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="12" rx="1"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><line x1="12" y1="14" x2="12" y2="14.01"/>
    </svg>
  ),
  programme_manager: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  monitoring_officer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
};

const needsInstitutionId = (role) => role === "trainer";

const InputField = ({ type, name, placeholder, value, onChange, required, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      position: "relative",
      marginBottom: "16px",
    }}>
      {icon && (
        <span style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          color: focused ? "#7c3aed" : "#9ca3af",
          display: "flex",
          alignItems: "center",
          transition: "color 0.2s",
          pointerEvents: "none",
          zIndex: 1,
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: icon ? "13px 14px 13px 42px" : "13px 14px",
          border: focused ? "2px solid #7c3aed" : "2px solid #e5e7eb",
          borderRadius: "10px",
          fontSize: "14px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "400",
          color: "#111827",
          backgroundColor: focused ? "#faf5ff" : "#f9fafb",
          outline: "none",
          transition: "all 0.2s ease",
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 4px rgba(124, 58, 237, 0.08)" : "none",
        }}
      />
    </div>
  );
};

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: roles[0],
    institutionName: ""
  });
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const res = await API.get("/auth/institutions");
        setInstitutions(res.data.data?.institutions || []);
      } catch {
        setInstitutions([]);
      }
    };
    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "role" && !needsInstitutionId(value) ? { institutionName: "" } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(needsInstitutionId(form.role) && form.institutionName.trim()
          ? { institutionName: form.institutionName.trim() }
          : {})
      };
      const res = await API.post("/auth/signup", payload);
      login(res.data.token, res.data.user);
      const pendingInvite = getPendingInvite();
      const isStudentInviteSignup = pendingInvite && res.data.user.role === "student";
      if (pendingInvite && !isStudentInviteSignup) clearPendingInvite();
      const nextPath = isStudentInviteSignup
        ? getInvitePath(pendingInvite)
        : getDashboardPath(res.data.user.role);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .signup-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Poppins', sans-serif;
          background: #f3f0ff;
          position: relative;
          overflow: hidden;
        }

        /* Left decorative panel */
        .signup-panel {
          display: none;
          width: 45%;
          background: linear-gradient(145deg, #5b21b6 0%, #7c3aed 45%, #a855f7 100%);
          position: relative;
          overflow: hidden;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px;
        }

        @media (min-width: 900px) {
          .signup-panel { display: flex; }
        }

        .signup-panel::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -100px;
          right: -100px;
        }

        .signup-panel::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -80px;
          left: -60px;
        }

        .panel-orb {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          bottom: 120px;
          right: -50px;
        }

        .panel-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }

        .panel-logo {
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.15);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .panel-title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin: 0 0 12px;
          line-height: 1.2;
        }

        .panel-sub {
          font-size: 15px;
          font-weight: 400;
          opacity: 0.8;
          line-height: 1.6;
          max-width: 280px;
          margin: 0 auto 40px;
        }

        .panel-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
        }

        .panel-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 14px 16px;
          backdrop-filter: blur(6px);
        }

        .feature-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a78bfa;
          flex-shrink: 0;
        }

        .feature-text {
          font-size: 13.5px;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Right form side */
        .signup-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .signup-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 4px 40px rgba(109, 40, 217, 0.1), 0 1px 3px rgba(0,0,0,0.05);
        }

        @media (max-width: 480px) {
          .signup-card { padding: 28px 20px; border-radius: 16px; }
        }

        .signup-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        @media (min-width: 900px) {
          .signup-mobile-logo { display: none; }
        }

        .mobile-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-logo-name {
          font-size: 18px;
          font-weight: 700;
          color: #5b21b6;
          letter-spacing: -0.3px;
        }

        .signup-heading {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
        }

        .signup-sub {
          font-size: 13.5px;
          color: #6b7280;
          margin: 0 0 28px;
          font-weight: 400;
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label-text {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        @media (max-width: 380px) {
          .role-grid { grid-template-columns: 1fr; }
        }

        .role-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          background: #f9fafb;
          transition: all 0.18s ease;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-align: left;
        }

        .role-pill.active {
          border-color: #7c3aed;
          background: #faf5ff;
          color: #5b21b6;
        }

        .role-pill:hover:not(.active) {
          border-color: #c4b5fd;
          background: #f5f3ff;
        }

        .role-pill-icon {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .role-pill.active .role-pill-icon {
          opacity: 1;
          color: #7c3aed;
        }

        .select-styled {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          font-weight: 400;
          color: #111827;
          background-color: #f9fafb;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s ease;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .select-styled:focus {
          border-color: #7c3aed;
          background-color: #faf5ff;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .select-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .select-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .institution-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: -10px;
          margin-bottom: 16px;
          padding-left: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pw-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }

        .pw-toggle:hover { color: #7c3aed; }

        .divider {
          height: 1px;
          background: #f3f4f6;
          margin: 20px 0;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.2px;
          box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.45);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-link-row {
          margin-top: 20px;
          text-align: center;
          font-size: 13.5px;
          color: #6b7280;
        }

        .login-link {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .login-link:hover { text-decoration: underline; }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #9ca3af;
          margin-bottom: 10px;
        }
      `}</style>

      <div className="signup-root">
        {/* Decorative left panel */}
        <div className="signup-panel">
          <div className="panel-orb" />
          <div className="panel-content">
            <div className="panel-logo">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <h1 className="panel-title">Start your journey<br />with EduTrack</h1>
            <p className="panel-sub">A unified platform for students, trainers, and institutions to grow together.</p>
            <div className="panel-features">
              {[
                "Track programmes and milestones in real-time",
                "Collaborate across institutions seamlessly",
                "Role-based dashboards for every stakeholder",
              ].map((f, i) => (
                <div className="panel-feature" key={i}>
                  <div className="feature-dot" />
                  <span className="feature-text">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="signup-form-side">
          <div className="signup-card">
            {/* Mobile logo */}
            <div className="signup-mobile-logo">
              <div className="mobile-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <span className="mobile-logo-name">EduTrack</span>
            </div>

            <h2 className="signup-heading">Create your account</h2>
            <p className="signup-sub">Fill in the details below to get started.</p>

            {error && (
              <div className="error-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <label className="label-text">Full Name</label>
              <InputField
                type="text"
                name="name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
                required
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                }
              />

              {/* Email */}
              <label className="label-text">Email Address</label>
              <InputField
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                required
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                }
              />

              {/* Password */}
              <label className="label-text">Password</label>
              <div className="pw-wrap">
                <span style={{
                  position: "absolute", left: "14px", top: "50%",
                  transform: "translateY(-50%)", color: "#9ca3af",
                  display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%", padding: "13px 42px 13px 42px",
                    border: "2px solid #e5e7eb", borderRadius: "10px",
                    fontSize: "14px", fontFamily: "'Poppins', sans-serif",
                    fontWeight: "400", color: "#111827",
                    backgroundColor: "#f9fafb", outline: "none",
                    transition: "all 0.2s ease", boxSizing: "border-box",
                  }}
                  onFocus={e => {
                    e.target.style.border = "2px solid #7c3aed";
                    e.target.style.backgroundColor = "#faf5ff";
                    e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.08)";
                  }}
                  onBlur={e => {
                    e.target.style.border = "2px solid #e5e7eb";
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <div className="divider" />

              {/* Role selector */}
              <div className="section-label">Select your role</div>
              <div className="role-grid">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`role-pill ${form.role === role ? "active" : ""}`}
                    onClick={() => handleChange({ target: { name: "role", value: role } })}
                  >
                    <span className="role-pill-icon">{roleIcons[role]}</span>
                    {roleLabels[role]}
                  </button>
                ))}
              </div>

              {/* Institution select */}
              {needsInstitutionId(form.role) && (
                <>
                  <label className="label-text" style={{ marginTop: "4px" }}>Institution</label>
                  <div className="select-wrap">
                    <span className="select-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="9" width="18" height="12" rx="1"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>
                      </svg>
                    </span>
                    <select
                      name="institutionName"
                      value={form.institutionName}
                      onChange={handleChange}
                      className="select-styled"
                      required
                    >
                      <option value="">Select your institution</option>
                      {institutions.map((inst) => (
                        <option key={inst._id} value={inst.name}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="institution-hint">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Select the institution you are affiliated with as a trainer.
                  </p>
                </>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="spinner" />Creating account…</>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <div className="login-link-row">
              Already have an account?
              <a href="/login" className="login-link">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;