import React from "react";

const Loader = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

      .sb-loader-root {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 240px;
        gap: 28px;
        font-family: 'Poppins', sans-serif;
        background: transparent;
      }

      /* ── Orbit ring stack ── */
      .sb-loader-rig {
        position: relative;
        width: 72px;
        height: 72px;
      }

      /* Outer ring – slow clockwise */
      .sb-ring-outer {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2.5px solid transparent;
        border-top-color: #7c3aed;
        border-right-color: #a855f7;
        animation: sb-spin-cw 1.2s cubic-bezier(0.4,0,0.2,1) infinite;
      }

      /* Middle ring – medium counter-clockwise */
      .sb-ring-mid {
        position: absolute;
        inset: 12px;
        border-radius: 50%;
        border: 2px solid transparent;
        border-bottom-color: #c084fc;
        border-left-color: #7c3aed;
        animation: sb-spin-ccw 1s cubic-bezier(0.4,0,0.2,1) infinite;
      }

      /* Inner core – pulsing dot */
      .sb-ring-core {
        position: absolute;
        inset: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        box-shadow:
          0 0 0 0 rgba(124, 58, 237, 0.5),
          0 2px 8px rgba(124, 58, 237, 0.35);
        animation: sb-pulse-core 1.2s ease-in-out infinite;
      }

      /* Glow halo behind the rig */
      .sb-loader-rig::before {
        content: '';
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
        animation: sb-halo 1.2s ease-in-out infinite alternate;
      }

      /* ── Orbiting satellite dot ── */
      .sb-satellite-track {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        animation: sb-spin-cw 1.8s linear infinite;
      }
      .sb-satellite {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #7c3aed;
        box-shadow: 0 0 8px 2px rgba(124,58,237,0.5);
      }

      /* ── Loading text ── */
      .sb-loader-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .sb-loader-text {
        font-size: 0.82rem;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #7c3aed;
      }

      /* Three bouncing dots */
      .sb-dots {
        display: flex;
        gap: 5px;
        align-items: center;
      }
      .sb-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #c084fc;
        animation: sb-bounce 1.2s ease-in-out infinite;
      }
      .sb-dot:nth-child(1) { animation-delay: 0s; }
      .sb-dot:nth-child(2) { animation-delay: 0.18s; }
      .sb-dot:nth-child(3) { animation-delay: 0.36s; }

      /* ── Keyframes ── */
      @keyframes sb-spin-cw {
        to { transform: rotate(360deg); }
      }
      @keyframes sb-spin-ccw {
        to { transform: rotate(-360deg); }
      }
      @keyframes sb-pulse-core {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(124,58,237,0.45), 0 2px 8px rgba(124,58,237,0.3);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 5px rgba(124,58,237,0.1), 0 2px 12px rgba(124,58,237,0.4);
          transform: scale(1.1);
        }
      }
      @keyframes sb-halo {
        from { opacity: 0.6; transform: scale(0.95); }
        to   { opacity: 1;   transform: scale(1.05); }
      }
      @keyframes sb-bounce {
        0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
        40%           { transform: translateY(-5px); opacity: 1;   }
      }
    `}</style>

    <div className="sb-loader-root" role="status" aria-label="Loading">
      {/* Spinner rig */}
      <div className="sb-loader-rig">
        <div className="sb-ring-outer" />
        <div className="sb-ring-mid" />
        <div className="sb-satellite-track">
          <div className="sb-satellite" />
        </div>
        <div className="sb-ring-core" />
      </div>

      {/* Label */}
      <div className="sb-loader-label">
        <span className="sb-loader-text">Loading</span>
        <div className="sb-dots" aria-hidden="true">
          <span className="sb-dot" />
          <span className="sb-dot" />
          <span className="sb-dot" />
        </div>
      </div>
    </div>
  </>
);

export default Loader;