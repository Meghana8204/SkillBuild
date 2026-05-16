import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { joinBatch } from "../services/apiMethods";
import { useAuth } from "../context/useAuth";
import { clearPendingInvite, savePendingInvite } from "../utils/invite";

const statusConfig = {
  checking: {
    accent: "purple",
    icon: null, // animated spinner
    title: "Verifying Invite",
  },
  login_required: {
    accent: "purple",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    ),
    title: "Sign In to Continue",
  },
  success: {
    accent: "green",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "You're In!",
  },
  error: {
    accent: "red",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    title: "Something Went Wrong",
  },
};

const accentTokens = {
  purple: { iconBg: "#f5f3ff", iconColor: "#7c3aed", border: "#ede9fe" },
  green:  { iconBg: "#f0fdf4", iconColor: "#16a34a", border: "#bbf7d0" },
  red:    { iconBg: "#fef2f2", iconColor: "#dc2626", border: "#fecaca" },
};

const JoinBatch = () => {
  const { batchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token: authToken } = useAuth();
  const inviteToken = searchParams.get("token");
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking invite link…");

  useEffect(() => {
    const acceptInvite = async () => {
      if (!batchId || !inviteToken) {
        setStatus("error");
        setMessage("This invite link is missing required information. Please request a new link.");
        return;
      }
      if (!authToken) {
        savePendingInvite({ batchId, token: inviteToken });
        setStatus("login_required");
        setMessage("You need a student account to join this batch. Log in or create an account to continue.");
        return;
      }
      if (user?.role !== "student") {
        clearPendingInvite();
        setStatus("error");
        setMessage("Only students can use batch invite links. Please log in with a student account.");
        return;
      }
      try {
        await joinBatch(batchId, inviteToken);
        clearPendingInvite();
        setStatus("success");
        setMessage("You've successfully joined the batch. Redirecting you to your dashboard…");
        setTimeout(() => navigate("/student/dashboard", { replace: true }), 1800);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to join the batch. The link may have expired.");
      }
    };
    acceptInvite();
  }, [authToken, batchId, inviteToken, navigate, user?.role]);

  const cfg = statusConfig[status];
  const tokens = accentTokens[cfg.accent];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .jb-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background: #f3f0ff;
          font-family: 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Background blobs */
        .jb-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .jb-blob-1 {
          width: 400px; height: 400px;
          background: rgba(167, 139, 250, 0.25);
          top: -100px; right: -80px;
        }
        .jb-blob-2 {
          width: 300px; height: 300px;
          background: rgba(139, 92, 246, 0.15);
          bottom: -60px; left: -60px;
        }

        .jb-card {
          position: relative; z-index: 1;
          background: white;
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%; max-width: 440px;
          box-shadow: 0 4px 40px rgba(109, 40, 217, 0.1), 0 1px 3px rgba(0,0,0,0.05);
          animation: fadeUp 0.35s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .jb-card { padding: 28px 20px; border-radius: 16px; }
        }

        /* Logo row */
        .jb-logo-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
        }
        .jb-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .jb-logo-name {
          font-size: 16px; font-weight: 700; color: #5b21b6; letter-spacing: -0.2px;
        }

        /* Status icon circle */
        .jb-icon-wrap {
          width: 64px; height: 64px; border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .jb-eyebrow {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.8px; color: #9ca3af; margin-bottom: 6px;
        }

        .jb-title {
          font-size: 24px; font-weight: 700; color: #111827;
          letter-spacing: -0.3px; margin: 0 0 10px;
        }

        .jb-message {
          font-size: 14px; color: #6b7280; line-height: 1.65;
          margin: 0 0 24px;
        }

        /* Progress bar */
        .jb-progress-track {
          height: 4px; border-radius: 99px; background: #ede9fe;
          overflow: hidden; margin-bottom: 24px;
        }
        .jb-progress-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #7c3aed, #a855f7);
          animation: shimmer 1.4s ease-in-out infinite;
          width: 55%;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        /* Spinner */
        .jb-spinner {
          width: 28px; height: 28px;
          border: 3px solid rgba(124, 58, 237, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .jb-divider { height: 1px; background: #f3f4f6; margin: 4px 0 24px; }

        /* Buttons */
        .jb-btn-row { display: flex; flex-wrap: wrap; gap: 10px; }

        .jb-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white; font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 600;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3);
          transition: all 0.2s ease;
        }
        .jb-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(109,40,217,0.4); }

        .jb-btn-primary.green {
          background: linear-gradient(135deg, #16a34a, #15803d);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }
        .jb-btn-primary.green:hover { box-shadow: 0 6px 18px rgba(22,163,74,0.4); }

        .jb-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px; border-radius: 10px;
          border: 2px solid #ede9fe;
          color: #7c3aed; font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          background: white;
        }
        .jb-btn-outline:hover { background: #faf5ff; border-color: #c4b5fd; }

        /* Success pulse ring */
        .jb-success-ring {
          position: relative;
        }
        .jb-success-ring::after {
          content: '';
          position: absolute; inset: -6px;
          border-radius: 24px;
          border: 2px solid rgba(22, 163, 74, 0.25);
          animation: ringPulse 1.5s ease-out infinite;
        }
        @keyframes ringPulse {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.2); }
        }

        .jb-checking-label {
          font-size: 12.5px; color: #9ca3af; font-weight: 500; margin-top: 4px;
        }
      `}</style>

      <div className="jb-root">
        <div className="jb-blob jb-blob-1" />
        <div className="jb-blob jb-blob-2" />

        <div className="jb-card">
          {/* Logo */}
          <div className="jb-logo-row">
            <div className="jb-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <span className="jb-logo-name">SkillBridge</span>
          </div>

          {/* Status icon */}
          <div
            className={`jb-icon-wrap ${status === "success" ? "jb-success-ring" : ""}`}
            style={{ background: tokens.iconBg, borderColor: tokens.border, color: tokens.iconColor }}
          >
            {status === "checking"
              ? <div className="jb-spinner" />
              : cfg.icon
            }
          </div>

          {/* Text */}
          <p className="jb-eyebrow">Batch Invite</p>
          <h1 className="jb-title">{cfg.title}</h1>
          <p className="jb-message">{message}</p>

          {/* Checking progress */}
          {status === "checking" && (
            <>
              <div className="jb-progress-track">
                <div className="jb-progress-fill" />
              </div>
              <p className="jb-checking-label">Please wait while we verify your invite…</p>
            </>
          )}

          {/* CTAs */}
          {status === "login_required" && (
            <>
              <div className="jb-divider" />
              <div className="jb-btn-row">
                <Link className="jb-btn-primary" to="/login">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Log In
                </Link>
                <Link className="jb-btn-outline" to="/signup">
                  Create Account
                </Link>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="jb-divider" />
              <Link className="jb-btn-primary green" to="/student/dashboard">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Go to Dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="jb-divider" />
              <Link className="jb-btn-primary" to="/login">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default JoinBatch;