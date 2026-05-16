import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../utils/routes";
import { clearPendingInvite, getInvitePath, getPendingInvite } from "../utils/invite";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.token, res.data.user);
      const pendingInvite = getPendingInvite();
      const isStudentInviteLogin = pendingInvite && res.data.user.role === "student";
      if (pendingInvite && !isStudentInviteLogin) clearPendingInvite();
      const nextPath = isStudentInviteLogin
        ? getInvitePath(pendingInvite)
        : getDashboardPath(res.data.user.role);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 14px 13px 42px",
    border: focused[field] ? "2px solid #7c3aed" : "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "400",
    color: "#111827",
    backgroundColor: focused[field] ? "#faf5ff" : "#f9fafb",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    boxShadow: focused[field] ? "0 0 0 4px rgba(124, 58, 237, 0.08)" : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Poppins', sans-serif;
          background: #f3f0ff;
          overflow: hidden;
          position: relative;
        }

        /* Left decorative panel */
        .login-panel {
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
          .login-panel { display: flex; }
        }

        .login-panel::before {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -100px; right: -100px;
        }

        .login-panel::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -80px; left: -60px;
        }

        .panel-orb {
          position: absolute;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          bottom: 120px; right: -50px;
        }

        .panel-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }

        .panel-logo {
          width: 64px; height: 64px;
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
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #a78bfa;
          flex-shrink: 0;
        }

        .feature-text {
          font-size: 13.5px;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Form side */
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 4px 40px rgba(109, 40, 217, 0.1), 0 1px 3px rgba(0,0,0,0.05);
        }

        @media (max-width: 480px) {
          .login-card { padding: 28px 20px; border-radius: 16px; }
        }

        .login-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        @media (min-width: 900px) {
          .login-mobile-logo { display: none; }
        }

        .mobile-logo-icon {
          width: 40px; height: 40px;
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

        .login-heading {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px;
          letter-spacing: -0.4px;
        }

        .login-sub {
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

        .input-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 1;
          transition: color 0.2s;
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

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 20px;
        }

        .forgot-link {
          font-size: 12.5px;
          font-weight: 500;
          color: #7c3aed;
          text-decoration: none;
        }

        .forgot-link:hover { text-decoration: underline; }

        .divider {
          height: 1px;
          background: #f3f4f6;
          margin: 4px 0 20px;
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
          letter-spacing: 0.2px;
          box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.45);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .signup-link-row {
          margin-top: 20px;
          text-align: center;
          font-size: 13.5px;
          color: #6b7280;
        }

        .signup-link {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .signup-link:hover { text-decoration: underline; }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f5f3ff;
          border: 1px solid #ede9fe;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #6d28d9;
          margin-bottom: 16px;
          letter-spacing: 0.2px;
        }
      `}</style>

      <div className="login-root">
        {/* Decorative left panel */}
        <div className="login-panel">
          <div className="panel-orb" />
          <div className="panel-content">
            <div className="panel-logo">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <h1 className="panel-title">Welcome back<br />to EduTrack</h1>
            <p className="panel-sub">Sign in to continue managing your programmes, students, and institutions.</p>
            <div className="panel-features">
              {[
                "Pick up right where you left off",
                "Access your role-based dashboard instantly",
                "Stay connected with your institution",
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
        <div className="login-form-side">
          <div className="login-card">
            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <div className="mobile-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <span className="mobile-logo-name">EduTrack</span>
            </div>

            <div className="welcome-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Welcome back
            </div>

            <h2 className="login-heading">Sign in to your account</h2>
            <p className="login-sub">Enter your credentials to access your dashboard.</p>

            {error && (
              <div className="error-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <label className="label-text">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon" style={{ color: focused.email ? "#7c3aed" : "#9ca3af" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={inputStyle("email")}
                  onFocus={() => setFocused(f => ({ ...f, email: true }))}
                  onBlur={() => setFocused(f => ({ ...f, email: false }))}
                />
              </div>

              {/* Password */}
              <label className="label-text">Password</label>
              <div className="input-wrap">
                <span className="input-icon" style={{ color: focused.password ? "#7c3aed" : "#9ca3af" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle("password"), paddingRight: "42px" }}
                  onFocus={() => setFocused(f => ({ ...f, password: true }))}
                  onBlur={() => setFocused(f => ({ ...f, password: false }))}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="forgot-row">
                <a href="/forgot-password" className="forgot-link">Forgot password?</a>
              </div>

              <div className="divider" />

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="spinner" />Signing in…</>
                ) : (
                  <>Sign In →</>
                )}
              </button>
            </form>

            <div className="signup-link-row">
              Don't have an account?
              <a href="/signup" className="signup-link">Create one</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;