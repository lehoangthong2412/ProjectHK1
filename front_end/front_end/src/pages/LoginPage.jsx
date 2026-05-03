import React, { useState } from "react";
import { Truck } from "lucide-react";

export default function LoginPage({ onLogin, errorMessage }) {
  const [username, setUsername] = useState("admin01");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onLogin({ username, password });
    setLoading(false);
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-left">
          <div>
            <div className="login-chip">
              <Truck size={16} />
              CourierXpress
            </div>
            <h1>Courier Management UI</h1>
            <p>
              Full React interface based on your database tables: users, customers, branches,
              shipment types, shipments, shipment status history, and bills.
            </p>
          </div>

          <div className="login-feature-grid">
            <div className="login-feature">
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>Roles</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Admin / Agent / Customer</div>
            </div>
            <div className="login-feature">
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>Core Modules</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Booking, Tracking, Billing</div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form">
            <h2>Login</h2>
            <p>Nhập username và password để đăng nhập với tài khoản Admin, Agent hoặc Customer.</p>

            <div className="mt-20">
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mt-16">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 mt-16" style={{ fontSize: 14 }}>
                {errorMessage}
              </div>
            )}

            <div className="flex gap-12 mt-24">
              <button className="btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Login"}
              </button>
              <button className="btn-outline" type="button">Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
