import { Outlet, NavLink } from "react-router";
import { Waves } from "lucide-react";

const GlowOrb = ({ x, y, color }: { x: string; y: string; color: string }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: x,
      top: y,
      width: 400,
      height: 400,
      transform: "translate(-50%, -50%)",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: 0.1,
      filter: "blur(40px)",
    }}
  />
);

export function Layout() {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "#07070f", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GlowOrb x="15%" y="30%" color="#3b82f6" />
        <GlowOrb x="80%" y="20%" color="#8b5cf6" />
        <GlowOrb x="50%" y="80%" color="#6366f1" />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(7,7,15,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 0 20px rgba(139,92,246,0.5)",
            }}
          >
            <Waves size={18} color="white" />
          </div>
          <div>
            <div className="flex items-center gap-2" style={{ lineHeight: 1 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                WidiAI
              </span>
              <span
                className="rounded px-1.5 py-0.5"
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  background: "rgba(139,92,246,0.2)",
                  color: "#a78bfa",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                BETA
              </span>
            </div>
            <p
              style={{
                fontSize: 10,
                color: "#4b5563",
                marginTop: 1,
                letterSpacing: "0.04em",
              }}
            >
              Wave MIDI AI
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {[
            { label: "Dashboard", to: "/" },
            { label: "History", to: "/history" },
            { label: "Settings", to: "/settings" },
          ].map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#a78bfa" : "#6b7280",
                padding: "5px 14px",
                borderRadius: 8,
                background: isActive ? "rgba(139,92,246,0.12)" : "transparent",
                border: isActive
                  ? "1px solid rgba(139,92,246,0.25)"
                  : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s",
                display: "inline-block",
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── PAGE CONTENT ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
