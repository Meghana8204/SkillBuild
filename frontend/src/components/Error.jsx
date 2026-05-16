import React, { useState } from "react";

const ErrorAlert = ({ message = "Something went wrong. Please try again." }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

        .sb-error-wrap {
          font-family: 'Poppins', sans-serif;
          animation: sb-err-in 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes sb-err-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        .sb-error-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #fff5f5;
          border: 1.5px solid #fecaca;
          border-left: 4px solid #ef4444;
          border-radius: 14px;
          padding: 16px 18px;
          box-shadow: 0 4px 20px rgba(239,68,68,0.08);
          overflow: hidden;
        }

        /* Subtle top-right glow */
        .sb-error-card::before {
          content: '';
          position: absolute;
          top: -20px;
          right: -20px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Icon circle */
        .sb-error-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border: 1.5px solid #fca5a5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .sb-error-icon svg {
          width: 16px;
          height: 16px;
        }

        /* Text block */
        .sb-error-body { flex: 1; min-width: 0; }
        .sb-error-title {
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #b91c1c;
          margin-bottom: 3px;
        }
        .sb-error-msg {
          font-size: 0.875rem;
          font-weight: 400;
          color: #c0392b;
          line-height: 1.55;
          word-break: break-word;
        }

        /* Dismiss button */
        .sb-error-dismiss {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1.5px solid #fca5a5;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.15s;
          padding: 0;
          margin-top: 2px;
          align-self: flex-start;
        }
        .sb-error-dismiss:hover {
          background: #fecaca;
          border-color: #f87171;
          transform: scale(1.08);
        }
        .sb-error-dismiss svg {
          width: 12px;
          height: 12px;
          stroke: #ef4444;
          stroke-width: 2.2;
          stroke-linecap: round;
        }

        /* Shimmer bar at bottom */
        .sb-error-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #ef4444, #f87171, #fca5a5, #ef4444);
          background-size: 200% 100%;
          animation: sb-err-shimmer 2.5s linear infinite;
          border-radius: 0 0 14px 14px;
        }
        @keyframes sb-err-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="sb-error-wrap" role="alert" aria-live="assertive">
        <div className="sb-error-card">
          {/* Icon */}
          <div className="sb-error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#fca5a5" />
              <line x1="12" y1="7" x2="12" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="1" fill="#ef4444"/>
            </svg>
          </div>

          {/* Message */}
          <div className="sb-error-body">
            <div className="sb-error-title">Error</div>
            <div className="sb-error-msg">{message}</div>
          </div>

          {/* Dismiss */}
          <button
            className="sb-error-dismiss"
            onClick={() => setVisible(false)}
            aria-label="Dismiss error"
          >
            <svg viewBox="0 0 12 12" fill="none">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1"  y2="11" />
            </svg>
          </button>

          {/* Shimmer bar */}
          <div className="sb-error-bar" aria-hidden="true" />
        </div>
      </div>
    </>
  );
};

export default ErrorAlert;