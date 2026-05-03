import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import PublicTrackingPage from "./pages/PublicTrackingPage";
import Sidebar from "./components/layout/Sidebar";
import AdminDashboard from "./features/admin/AdminDashboard";
import AgentDashboard from "./features/agent/AgentDashboard";
import CustomerDashboard from "./features/customer/CustomerDashboard";
import { api, setAuthToken, clearAuthToken } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("admin");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async ({ username, password }) => {
    try {
      const loggedUser = await api.login(username, password);
      setAuthToken(loggedUser.token);
      setUser(loggedUser);
      setLoginError("");
      setCurrentScreen(
        loggedUser.role === "ADMIN"
          ? "admin"
          : loggedUser.role === "AGENT"
          ? "agent"
          : "customer"
      );
    } catch (error) {
      setLoginError(error.message || "Login thất bại. Vui lòng thử lại.");
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setCurrentScreen("admin");
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} errorMessage={loginError} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentRole={user.role}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        onLogout={handleLogout}
      />

      <main className="main-area">
        {currentScreen === "admin" && <AdminDashboard />}
        {currentScreen === "agent" && <AgentDashboard />}
        {currentScreen === "customer" && <CustomerDashboard />}
        {currentScreen === "public-track" && <PublicTrackingPage />}
      </main>
    </div>
  );
}
